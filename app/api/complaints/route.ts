
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

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

function getText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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

    const consumerName = getText(body.consumer_name);
    const documentType = getText(body.document_type);
    const documentNumber = getText(body.document_number);
    const consumerAddress = getText(body.consumer_address);
    const consumerEmail = getText(body.consumer_email);
    const consumerPhone = getText(body.consumer_phone);

    const isMinor = body.is_minor === true;
    const representativeName = getText(body.representative_name);
    const representativeDocument = getText(
      body.representative_document
    );

    const complaintType = getText(body.complaint_type);
    const orderIdInput = getText(body.order_id)
      .replace(/^#/, "")
      .trim();

    const productService = getText(body.product_service);
    const detail = getText(body.detail);
    const customerRequest = getText(body.customer_request);

    const responseEmail = getText(body.response_email) || consumerEmail;

    const requiredFields = [
      consumerName,
      documentType,
      documentNumber,
      consumerAddress,
      consumerEmail,
      consumerPhone,
      complaintType,
      productService,
      detail,
      customerRequest,
      responseEmail,
    ];

    if (requiredFields.some((field) => !field)) {
      return NextResponse.json(
        { error: "Completa todos los campos obligatorios." },
        { status: 400 }
      );
    }

    if (!["reclamo", "queja"].includes(complaintType)) {
      return NextResponse.json(
        { error: "El tipo de registro no es válido." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(consumerEmail) ||
      !emailRegex.test(responseEmail)
    ) {
      return NextResponse.json(
        { error: "Ingresa un correo electrónico válido." },
        { status: 400 }
      );
    }

    const phoneDigits = consumerPhone.replace(/\D/g, "");

    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      return NextResponse.json(
        { error: "Ingresa un número de teléfono válido." },
        { status: 400 }
      );
    }

    if (
      consumerName.length > 200 ||
      documentType.length > 30 ||
      documentNumber.length > 30 ||
      consumerAddress.length > 500 ||
      consumerEmail.length > 254 ||
      consumerPhone.length > 30 ||
      productService.length > 300 ||
      detail.length > 10000 ||
      customerRequest.length > 5000
    ) {
      return NextResponse.json(
        { error: "Uno o más campos superan la longitud permitida." },
        { status: 400 }
      );
    }

    if (
      isMinor &&
      (!representativeName || !representativeDocument)
    ) {
      return NextResponse.json(
        {
          error:
            "Completa los datos del padre, madre o representante del menor.",
        },
        { status: 400 }
      );
    }

    // Resolver el pedido usando el código corto o el UUID completo.
    let orderId: string | null = null;

    if (orderIdInput) {
      const shortIdRegex = /^[0-9a-f]{8}$/i;

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (
        !shortIdRegex.test(orderIdInput) &&
        !uuidRegex.test(orderIdInput)
      ) {
        return NextResponse.json(
          { error: "El número de pedido no tiene un formato válido." },
          { status: 400 }
        );
      }

      const { data: foundOrderId, error: orderError } =
        await supabase.rpc("find_order_id_by_prefix", {
          order_prefix: orderIdInput,
        });

      if (orderError) {
        console.error("Error verificando pedido:", orderError);

        return NextResponse.json(
          { error: "No se pudo verificar el pedido indicado." },
          { status: 500 }
        );
      }

      if (!foundOrderId) {
        return NextResponse.json(
          {
            error:
              "No encontramos un pedido con ese número. Verifica el código ingresado.",
          },
          { status: 400 }
        );
      }

      orderId = foundOrderId;
    }

    const amount =
      body.amount === null ||
      body.amount === undefined ||
      body.amount === ""
        ? null
        : Number(body.amount);

    if (
      amount !== null &&
      (!Number.isFinite(amount) || amount < 0)
    ) {
      return NextResponse.json(
        { error: "El monto reclamado no es válido." },
        { status: 400 }
      );
    }

    // Registrar el reclamo o queja en Supabase.
    const { data: complaint, error: complaintError } = await supabase
      .from("complaints_book")
      .insert({
        consumer_name: consumerName,
        document_type: documentType,
        document_number: documentNumber,
        consumer_address: consumerAddress,
        consumer_email: consumerEmail,
        consumer_phone: consumerPhone,

        is_minor: isMinor,
        representative_name: isMinor ? representativeName : null,
        representative_document: isMinor
          ? representativeDocument
          : null,

        complaint_type: complaintType,
        order_id: orderId,
        product_service: productService,
        amount,
        detail,
        customer_request: customerRequest,
        response_email: responseEmail,
      })
      .select("id, created_at")
      .single();

    if (complaintError || !complaint) {
      console.error(
        "Error registrando reclamo:",
        complaintError
      );

      return NextResponse.json(
        { error: "No se pudo registrar el reclamo." },
        { status: 500 }
      );
    }

    // Enviar una copia del registro al correo del consumidor.
    let emailSent = false;

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);

        const safeName = escapeHtml(consumerName);
        const safeId = escapeHtml(String(complaint.id));
        const safeType = escapeHtml(complaintType);
        const safeProduct = escapeHtml(productService);
        const safeDetail = escapeHtml(detail);
        const safeRequest = escapeHtml(customerRequest);
        const safeOrderId = orderId
          ? `#${escapeHtml(orderIdInput)}`
          : "No especificado";

        const safeAmount =
          amount === null
            ? "No especificado"
            : new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
              }).format(amount);

        const { error: emailError } = await resend.emails.send({
          from: "Tu Tienda <onboarding@resend.dev>",
          to: [responseEmail],
          subject: `Constancia de tu ${complaintType} #${complaint.id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6;">
              <h2>Constancia del Libro de Reclamaciones</h2>

              <p>Hola, ${safeName}.</p>

              <p>Hemos recibido tu registro correctamente.</p>

              <div style="background: #f5f5f5; padding: 20px; border-radius: 10px;">
                <p><strong>Número de registro:</strong> #${safeId}</p>
                <p><strong>Tipo:</strong> ${safeType}</p>
                <p><strong>Número de pedido:</strong> ${safeOrderId}</p>
                <p><strong>Producto o servicio:</strong> ${safeProduct}</p>
                <p><strong>Monto reclamado:</strong> ${safeAmount}</p>
                <p><strong>Fecha:</strong> ${new Date(complaint.created_at).toLocaleString("es-PE", {
                  timeZone: "America/Lima",
                })}</p>
              </div>

              <h3>Detalle del registro</h3>
              <p style="white-space: pre-wrap;">${safeDetail}</p>

              <h3>Pedido del consumidor</h3>
              <p style="white-space: pre-wrap;">${safeRequest}</p>

              <p>Conserva este correo como constancia de tu registro.</p>
            </div>
          `,
        });

        if (emailError) {
          console.error(
            "No se pudo enviar la copia del reclamo:",
            emailError
          );
        } else {
          emailSent = true;
        }
      } catch (emailError) {
        console.error(
          "Error inesperado enviando copia del reclamo:",
          emailError
        );
      }
    } else {
      console.error(
        "No se encontró RESEND_API_KEY. No se envió la copia."
      );
    }

    return NextResponse.json(
      {
        success: true,
        complaintId: complaint.id,
        emailSent,
        message: "Registro recibido correctamente.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en API de reclamos:", error);

    return NextResponse.json(
      { error: "Ocurrió un error al registrar el reclamo." },
      { status: 500 }
    );
  }
}
