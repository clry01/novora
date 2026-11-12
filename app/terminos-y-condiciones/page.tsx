
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function TerminosPage() {
  return (
    <>
      <Header />

      <main className="bg-white">
        <section className="bg-gray-950 px-6 py-16 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Información legal
            </p>
            <h1 className="text-4xl font-black md:text-5xl">
              Términos y condiciones
            </h1>
            <p className="mt-5 text-gray-300">
              Condiciones generales para realizar compras en nuestra tienda.
            </p>
          </div>
        </section>

        <section className="px-6 py-14">
          <div className="mx-auto max-w-4xl space-y-10 text-gray-600 leading-8">

            <p>
              Estos términos y condiciones regulan el acceso y las compras
              realizadas a través de nuestra tienda online. Al realizar un
              pedido, el cliente declara haber leído la información
              correspondiente a su compra.
            </p>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                1. Identificación del vendedor
              </h2>
              <p>
                La tienda es operada por una persona natural. Los datos
                completos de identificación tributaria y comercial del
                vendedor deberán incorporarse antes del inicio de las
                operaciones comerciales.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                2. Productos y disponibilidad
              </h2>
              <p>
                Los productos se presentan con sus respectivas imágenes,
                descripciones, características y precios. La disponibilidad
                está sujeta al stock informado en la tienda.
              </p>
              <p className="mt-3">
                Si se presenta algún inconveniente con la disponibilidad
                de un producto después de realizar un pedido, nos
                comunicaremos con el cliente para informarle y coordinar
                una solución.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                3. Precios y costos de envío
              </h2>
              <p>
                Los precios se muestran en soles (S/). El costo de envío
                es de S/10 para Lima Metropolitana y Callao, según la
                cobertura disponible al momento de la compra.
              </p>
              <p className="mt-3">
                El importe total de la compra, incluidos los conceptos
                aplicables, se mostrará antes de confirmar el pedido.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                4. Proceso de compra y pagos
              </h2>
              <p>
                El cliente debe proporcionar información correcta para
                registrar su pedido y coordinar la entrega.
              </p>
              <p className="mt-3">
                Actualmente aceptamos pagos mediante Yape. Después de
                registrar el pedido, se mostrarán las instrucciones
                para realizar el pago y enviar el comprobante.
              </p>
              <p className="mt-3">
                El registro del pedido no significa que el pago haya
                sido verificado. La confirmación se realizará después
                de revisar el comprobante correspondiente.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                5. Envíos y entregas
              </h2>
              <p>
                Actualmente realizamos entregas en Lima Metropolitana
                y Callao. La coordinación y el tiempo de entrega pueden
                variar según el producto y la dirección del cliente.
              </p>
              <p className="mt-3">
                El cliente debe proporcionar una dirección completa
                y un número de contacto válido para facilitar la entrega.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                6. Seguimiento de pedidos
              </h2>
              <p>
                Una vez registrado el pedido, el cliente podrá recibir
                un enlace de seguimiento por correo electrónico para
                consultar las actualizaciones de su compra.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                7. Cambios, devoluciones y garantías
              </h2>
              <p>
                Las solicitudes relacionadas con productos defectuosos,
                cambios, devoluciones o garantías serán atendidas conforme
                a la legislación peruana vigente y a nuestra política
                de cambios y devoluciones.
              </p>
              <p className="mt-3">
                Estos términos no limitan los derechos que la legislación
                de protección al consumidor reconoce al cliente.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                8. Atención al cliente
              </h2>
              <p>
                Para consultas relacionadas con compras o pedidos,
                puedes comunicarte con nosotros mediante WhatsApp:
              </p>
              <a
                href="https://wa.me/51993521888"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block font-semibold text-blue-600 hover:text-blue-700"
              >
                +51 993 521 888
              </a>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                9. Legislación aplicable
              </h2>
              <p>
                Estos términos se interpretan conforme a las leyes
                de la República del Perú, incluyendo las disposiciones
                aplicables de protección y defensa del consumidor.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-6">
              <p className="text-sm">
                Documento en preparación. Los datos de identificación
                del vendedor y las condiciones comerciales definitivas
                deberán revisarse antes de habilitar las ventas al público.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6 text-sm">
              <Link
                href="/#productos"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                ← Volver a la tienda
              </Link>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
