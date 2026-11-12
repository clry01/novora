
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CambiosDevolucionesPage() {
  return (
    <>
      <Header />

      <main className="bg-white">
        <section className="bg-gray-950 px-6 py-16 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Atención al cliente
            </p>
            <h1 className="text-4xl font-black md:text-5xl">
              Cambios y devoluciones
            </h1>
            <p className="mt-5 text-gray-300">
              Queremos ayudarte si tienes algún inconveniente con tu compra.
            </p>
          </div>
        </section>

        <section className="px-6 py-14">
          <div className="mx-auto max-w-4xl space-y-10 leading-8 text-gray-600">

            <p>
              Nuestro objetivo es que recibas el producto que compraste
              en las condiciones ofrecidas. Si tienes algún inconveniente,
              puedes comunicarte con nosotros para evaluar tu caso.
            </p>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                1. ¿En qué casos puedes solicitar atención?
              </h2>
              <p>
                Puedes comunicarte con nosotros cuando:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>El producto llegue dañado o presente defectos.</li>
                <li>Recibas un producto diferente al solicitado.</li>
                <li>El producto no corresponda con las características ofrecidas.</li>
                <li>Se presente algún inconveniente relacionado con la entrega.</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                2. ¿Cómo realizar una solicitud?
              </h2>
              <p>
                Para ayudarnos a revisar tu caso, comunícate por WhatsApp
                indicando:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Número de pedido.</li>
                <li>Descripción del inconveniente.</li>
                <li>Fotografías o videos del producto, cuando corresponda.</li>
              </ul>
              <a
                href="https://wa.me/51993521888"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
              >
                Solicitar atención por WhatsApp
              </a>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                3. Evaluación de solicitudes
              </h2>
              <p>
                Revisaremos la información proporcionada y nos comunicaremos
                contigo para coordinar la solución que corresponda según
                las circunstancias del caso y la legislación vigente.
              </p>
              <p className="mt-3">
                La evaluación de una solicitud no elimina ni limita los
                derechos que reconoce la normativa peruana de protección
                al consumidor.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                4. Reembolsos
              </h2>
              <p>
                Cuando corresponda realizar una devolución de dinero,
                coordinaremos con el cliente el procedimiento y el medio
                adecuado para efectuarla.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                5. Garantías
              </h2>
              <p>
                Los productos estarán sujetos a las garantías que correspondan
                de acuerdo con sus características, lo ofrecido al momento
                de la compra y la legislación aplicable.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                6. Atención al cliente
              </h2>
              <p>
                Si tienes dudas o necesitas realizar una solicitud,
                puedes escribirnos:
              </p>
              <p className="mt-3 font-semibold text-gray-900">
                WhatsApp: +51 993 521 888
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-6">
              <p className="text-sm">
                Documento en preparación. Antes del lanzamiento se deben
                verificar los procedimientos operativos con el proveedor
                y completar los datos del vendedor. Ninguna disposición
                de esta política limita los derechos legales del consumidor.
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
