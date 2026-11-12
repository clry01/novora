import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "crypto";
import { Resend } from "resend";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

const SHIPPING_COST = 10;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function normalizeLocation(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function isCoveredLocation(departamento: string, provincia: string) {
  const department = normalizeLocation(departamento);
  const province = normalizeLocation(provincia);

  const isLima =
    (department === "lima" || department === "lima metropolitana") &&
    (province === "lima" || province === "lima metropolitana");

  const isCallao =
    (department === "callao" ||
      department === "provincia constitucional del callao") &&
    (province === "callao" ||
      province === "provincia constitucional del callao");

  return isLima || isCallao;
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseSecretKey) {
      return NextResponse.json(
        { error: "Falta configurar Supabase en el servidor." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const body = await request.json();

    const {
      nombres,
      apellidos,
      celular,
      correo,
      dni,
      departamento,
      provincia,
      distrito,
      direccion,
      referencia,
      items,
    } = body;

    const requiredFields = [
      nombres,
      apellidos,
      celular,
      correo,
      departamento,
      provincia,
      distrito,
      direccion,
    ];

    if (
      requiredFields.some(
        (field) => typeof field !== "string" || !field.trim()
      )
    ) {
      return NextResponse.json(
        { error: "Completa todos los campos obligatorios." },
        { status: 400 }
      );
    }

    // Validar cobertura de entrega desde el servidor
    if (!isCoveredLocation(departamento, provincia)) {
      return NextResponse.json(
        {
          error:
            "Por el momento solo realizamos entregas en Lima Metropolitana y Callao.",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50
    ) {
      return NextResponse.json(
        { error: "El carrito no contiene productos válidos." },
        { status: 400 }
      );
    }

    // Validar y agrupar productos repetidos
    const quantities = new Map<string, number>();

    for (const item of items) {
      if (
        !item ||
        typeof item.slug !== "string" ||
        !item.slug.trim() ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 20
      ) {
        return NextResponse.json(
          { error: "Hay un producto o cantidad no válida." },
          { status: 400 }
        );
      }

      const slug = item.slug.trim();
      const totalQuantity = (quantities.get(slug) ?? 0) + item.quantity;

      if (totalQuantity > 20) {
        return NextResponse.json(
          { error: "La cantidad máxima por producto es 20 unidades." },
          { status: 400 }
        );
      }

      quantities.set(slug, totalQuantity);
    }

    // Consultar los productos reales en Supabase
    const slugs = Array.from(quantities.keys());

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("slug, name, price, stock, is_active")
      .in("slug", slugs);

    if (productsError) {
      console.error("Error consultando productos:", productsError);

      return NextResponse.json(
        { error: "No se pudieron verificar los productos." },
        { status: 500 }
      );
    }

    if (!products || products.length !== slugs.length) {
      return NextResponse.json(
        { error: "Uno de los productos ya no está disponible." },
        { status: 400 }
      );
    }

    // Validar estado y stock, y calcular precios desde Supabase
    const orderItems = [];

    for (const slug of slugs) {
      const product = products.find((item) => item.slug === slug);

      if (!product || !product.is_active) {
        return NextResponse.json(
          { error: "Uno de los productos ya no está disponible." },
          { status: 400 }
        );
      }

      const quantity = quantities.get(slug)!;

      if (product.stock < quantity) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}.`,
          },
          { status: 400 }
        );
      }

      const unitPrice = Number(product.price);

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return NextResponse.json(
          { error: "El precio de uno de los productos no es válido." },
          { status: 400 }
        );
      }

      orderItems.push({
        product_slug: product.slug,
        product_name: product.name,
        quantity,
        unit_price: unitPrice,
        line_total: unitPrice * quantity,
      });
    }

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.line_total,
      0
    );

    // Calcular envío y total desde el servidor
    const shippingCost = SHIPPING_COST;
    const total = subtotal + shippingCost;

    // Generar token privado para el seguimiento del pedido
    const trackingToken = randomBytes(32).toString("hex");

    const trackingTokenHash = createHash("sha256")
      .update(trackingToken)
      .digest("hex");

    // Registrar el pedido
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_first_name: nombres.trim(),
        customer_last_name: apellidos.trim(),
        customer_phone: celular.trim(),
        customer_email: correo.trim(),
        customer_dni:
          typeof dni === "string" ? dni.trim() || null : null,
        department: departamento.trim(),
        province: provincia.trim(),
        district: distrito.trim(),
        address: direccion.trim(),
        reference:
          typeof referencia === "string"
            ? referencia.trim() || null
            : null,
        subtotal,
        shipping_cost: shippingCost,
        total,
        tracking_token_hash: trackingTokenHash,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Error creando pedido:", orderError);

      return NextResponse.json(
        { error: "No se pudo registrar el pedido." },
        { status: 500 }
      );
    }

    // Registrar los productos del pedido
    const itemsToInsert = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Error guardando productos:", itemsError);

      await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      return NextResponse.json(
        { error: "No se pudieron guardar los productos del pedido." },
        { status: 500 }
      );
    }

    // Construir enlace de seguimiento
    const requestUrl = new URL(request.url);

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin
    ).replace(/\/+$/, "");

    const trackingUrl = `${siteUrl}/pedido/${trackingToken}`;

    // Enviar correo al cliente
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);

        const customerName = escapeHtml(nombres.trim());
        const safeOrderId = escapeHtml(String(order.id));

        const formatCurrency = (amount: number) =>
          new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
          }).format(amount);

        const formattedSubtotal = formatCurrency(subtotal);
        const formattedShipping = formatCurrency(shippingCost);
        const formattedTotal = formatCurrency(total);

        const { data: emailData, error: emailError } =
          await resend.emails.send({
            from: "Tu Tienda <onboarding@resend.dev>",
            to: [correo.trim()],
            subject: `Tu pedido #${order.id} ha sido registrado`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6;">
                <h2>¡Gracias por tu compra, ${customerName}!</h2>

                <p>Tu pedido ha sido registrado correctamente.</p>

                <div style="background: #f5f5f5; padding: 20px; border-radius: 10px;">
                  <p><strong>Número de pedido:</strong> #${safeOrderId}</p>
                  <p><strong>Subtotal:</strong> ${formattedSubtotal}</p>
                  <p><strong>Envío:</strong> ${formattedShipping}</p>
                  <p><strong>Total a pagar:</strong> ${formattedTotal}</p>
                  <p><strong>Estado:</strong> Pendiente de pago</p>
                </div>

                <h3>Consulta tu pedido y realiza el pago</h3>

                <p>
                  Desde el siguiente enlace podrás consultar los productos
                  de tu compra y volver a visualizar el código QR de Plin.
                </p>

                <p style="margin: 30px 0;">
                  <a
                    href="${trackingUrl}"
                    style="background: #16a34a; color: white; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;"
                  >
                    Consultar mi pedido
                  </a>
                </p>

                <p>Después de realizar el pago, envíanos tu comprobante por WhatsApp.</p>

                <p>¡Gracias por confiar en nosotros!</p>
              </div>
            `,
          });

        if (emailError) {
          console.error("No se pudo enviar el correo:", emailError);
        } else {
          console.log("Correo de pedido enviado:", emailData?.id);
        }
      } catch (emailError) {
        console.error("Error inesperado enviando correo:", emailError);
      }
    } else {
      console.error("No se encontró RESEND_API_KEY. Correo no enviado.");
    }

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        trackingToken,
        subtotal,
        shippingCost,
        total,
        message: "Pedido registrado correctamente.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en API de pedidos:", error);

    return NextResponse.json(
      { error: "Ocurrió un error al procesar el pedido." },
      { status: 500 }
    );
  }
}