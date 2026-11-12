
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const instant = false;

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

const whatsappNumber = "51993521888";

const currency = (amount: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount);

const statusLabels: Record<string, string> = {
  pending: "Pendiente de pago",
  confirmed: "Pago confirmado",
  shipped: "Pedido enviado",
  delivered: "Pedido entregado",
  cancelled: "Pedido cancelado",
};

export default async function TrackingPage({ params }: PageProps) {
  const { token } = await params;

  // Validar formato del token
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    notFound();
  }

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Falta configurar Supabase en el servidor.");
  }

  // Crear cliente seguro de Supabase
  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // Convertir el token recibido a su hash
  const trackingTokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  // Buscar el pedido mediante el hash
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status, subtotal, shipping_cost, total")
    .eq("tracking_token_hash", trackingTokenHash)
    .maybeSingle();

  if (orderError) {
    console.error("Error consultando pedido:", orderError);
    throw new Error("No se pudo consultar el pedido.");
  }

  if (!order) {
    notFound();
  }

  // Consultar los productos del pedido
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_name, quantity, unit_price, line_total")
    .eq("order_id", order.id);

  if (itemsError) {
    console.error("Error consultando productos del pedido:", itemsError);
    throw new Error("No se pudieron consultar los productos.");
  }

  const status = String(order.status ?? "pending").toLowerCase();
  const isPending = status === "pending";
  const statusLabel = statusLabels[status] ?? status;

  const total = Number(order.total ?? 0);

  const whatsappMessage = encodeURIComponent(
    `Hola, realicé el pedido ${order.id} por ${currency(total)}. Adjunto mi comprobante de pago.`
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
              ✓
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Seguimiento de tu pedido
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Número de pedido: {order.id}
            </p>

            <div className="mt-5 inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
              {statusLabel}
            </div>
          </div>

          <div className="my-8 border-t border-gray-200" />

          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Resumen de tu compra
          </h2>

          <div className="space-y-4">
            {(items ?? []).map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {item.product_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Cantidad: {item.quantity}
                  </p>
                </div>

                <p className="whitespace-nowrap font-medium text-gray-800">
                  {currency(Number(item.line_total))}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{currency(Number(order.subtotal))}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Envío</span>
              <span>
                {Number(order.shipping_cost) === 0
                  ? "Por coordinar"
                  : currency(Number(order.shipping_cost))}
              </span>
            </div>

            <div className="flex justify-between pt-2 text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>{currency(total)}</span>
            </div>
          </div>

          {isPending && (
            <div className="mt-8 space-y-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Completa el pago de tu pedido
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Selecciona cualquiera de los siguientes medios de pago
                  y realiza el abono por el importe exacto.
                </p>

                <p className="mt-4 text-3xl font-black text-blue-700">
                  {currency(total)}
                </p>
              </div>

              {/* PLIN */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-16 items-center justify-center rounded-lg bg-purple-600 text-lg font-black text-white">
                    plin
                  </span>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Pago con Plin
                    </h3>
                    <p className="text-xs text-gray-500">
                      Escanea el código QR
                    </p>
                  </div>
                </div>

                <div className="mx-auto mt-5 w-full max-w-xs rounded-xl border border-gray-100 bg-white p-3">

                  {/* Logo y nombre de Plin */}
                  <div className="relative mx-auto h-[100px] w-full max-w-[105px] overflow-hidden">
                    <Image
                      src="/images/logo-plin.png"
                      alt="Plin y titular"
                      fill
                      className="object-cover"
                      style={{ objectPosition: "center 22%" }}
                    />
                  </div>

                  {/* Nombre del titular */}
                  <p className="relative top-12 text-center text-lg font-bold text-gray-900">
                    Ricardo Jacob Inga Tacza
                  </p>

                  <Image
                    src="/images/plin-qr-recortado.jpeg"
                    alt="Código QR de Plin para realizar el pago"
                    width={420}
                    height={420}
                    className="!h-[400px] !w-[400px] object-contain"
                  />

                </div>

                <div className="mt-5 text-center">
                  <p className="text-sm text-gray-500">
                    También puedes pagar al siguiente número
                  </p>

                  <p className="mt-1 text-2xl font-black text-gray-900">
                    993 521 888
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Titular: Ricardo Inga Tacza
                  </p>
                </div>
              </div>

              {/* INTERBANK */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-14 items-center justify-center rounded-lg bg-cyan-600 text-sm font-black text-white">
                    IBK
                  </span>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Transferencia Interbank
                    </h3>
                    <p className="text-xs text-gray-500">
                      Deposita o transfiere a esta cuenta
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      Número de cuenta
                    </p>
                    <p className="mt-1 break-all font-bold text-gray-900">
                      2003055969588
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      CCI
                    </p>
                    <p className="mt-1 break-all font-bold text-gray-900">
                      00320001305596958832
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Titular de la cuenta
                    </p>
                    <p className="mt-1 font-bold text-gray-900">
                      Ricardo Inga Tacza
                    </p>
                  </div>
                </div>
              </div>

              {/* BBVA */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-14 items-center justify-center rounded-lg bg-blue-700 text-sm font-black text-white">
                    BBVA
                  </span>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Transferencia BBVA
                    </h3>
                    <p className="text-xs text-gray-500">
                      Deposita o transfiere a esta cuenta
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      Número de cuenta
                    </p>
                    <p className="mt-1 break-all font-bold text-gray-900">
                      001108040206099721
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      CCI
                    </p>
                    <p className="mt-1 break-all font-bold text-gray-900">
                      01180400020609972126
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Titular de la cuenta
                    </p>
                    <p className="mt-1 font-bold text-gray-900">
                      Ricardo Inga Tacza
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm leading-6 text-gray-600">
                  Después de realizar el pago, envíanos tu comprobante
                  por WhatsApp indicando tu número de pedido.
                </p>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex w-full items-center justify-center rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                >
                  Enviar comprobante por WhatsApp
                </a>

                <p className="mt-4 text-xs text-gray-500">
                  Tu pedido permanecerá pendiente hasta que verifiquemos
                  el pago.
                </p>
              </div>
            </div>
          )}

          {status === "confirmed" && (
            <div className="mt-8 rounded-xl bg-green-50 p-5 text-center">
              <p className="font-semibold text-green-800">
                ¡Tu pago ha sido confirmado!
              </p>
              <p className="mt-2 text-sm text-green-700">
                Estamos preparando tu pedido.
              </p>
            </div>
          )}

          {status === "shipped" && (
            <div className="mt-8 rounded-xl bg-blue-50 p-5 text-center">
              <p className="font-semibold text-blue-800">
                Tu pedido está en camino.
              </p>
            </div>
          )}

          {status === "delivered" && (
            <div className="mt-8 rounded-xl bg-green-50 p-5 text-center">
              <p className="font-semibold text-green-800">
                Tu pedido figura como entregado.
              </p>
            </div>
          )}

          {status === "cancelled" && (
            <div className="mt-8 rounded-xl bg-red-50 p-5 text-center">
              <p className="font-semibold text-red-800">
                Este pedido ha sido cancelado.
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm font-semibold text-gray-600 underline hover:text-gray-900"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
