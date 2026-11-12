
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PoliticaPrivacidadPage() {
  return (
    <>
      <Header />

      <main className="bg-white">
        <section className="bg-gray-950 px-6 py-16 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Protección de datos
            </p>
            <h1 className="text-4xl font-black md:text-5xl">
              Política de privacidad
            </h1>
            <p className="mt-5 text-gray-300">
              Tu información personal merece ser tratada con responsabilidad.
            </p>
          </div>
        </section>

        <section className="px-6 py-14">
          <div className="mx-auto max-w-4xl space-y-10 leading-8 text-gray-600">
            <p>
              En nuestra tienda valoramos la privacidad de nuestros clientes.
              Esta política explica qué información podemos recopilar cuando
              navegas, realizas una compra o te comunicas con nosotros.
            </p>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                1. Información que recopilamos
              </h2>
              <p>
                Para gestionar los pedidos podemos solicitar los siguientes
                datos:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Nombres y apellidos.</li>
                <li>Número de teléfono.</li>
                <li>Dirección de entrega y referencias.</li>
                <li>Correo electrónico.</li>
                <li>Información relacionada con el pedido y el pago.</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                2. Uso de la información
              </h2>
              <p>
                Utilizamos los datos proporcionados para:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Registrar y gestionar los pedidos.</li>
                <li>Coordinar la preparación y entrega de productos.</li>
                <li>Verificar los pagos realizados.</li>
                <li>Enviar confirmaciones y actualizaciones del pedido.</li>
                <li>Atender consultas, solicitudes y reclamos.</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                3. Protección de la información
              </h2>
              <p>
                Adoptamos medidas técnicas y organizativas razonables para
                proteger la información personal frente a accesos no
                autorizados, pérdida, alteración o uso indebido.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                4. Compartición de datos
              </h2>
              <p>
                Cuando sea necesario para completar una compra, determinados
                datos de entrega podrán compartirse con proveedores logísticos
                o transportistas encargados de llevar el producto al cliente.
              </p>
              <p className="mt-3">
                No comercializamos los datos personales de nuestros clientes.
                Cualquier otro tratamiento o comunicación de datos se realizará
                conforme a la legislación aplicable.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                5. Conservación de datos
              </h2>
              <p>
                Conservaremos la información durante el tiempo necesario
                para gestionar los pedidos, atender solicitudes y cumplir
                las obligaciones legales aplicables.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                6. Derechos del titular de los datos
              </h2>
              <p>
                Puedes solicitar información sobre tus datos personales,
                así como ejercer los derechos de acceso, rectificación,
                cancelación y oposición (ARCO), de acuerdo con la normativa
                peruana vigente.
              </p>
              <p className="mt-3">
                Para realizar una solicitud puedes comunicarte con nosotros
                mediante WhatsApp.
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
                7. Cookies y tecnologías similares
              </h2>
              <p>
                La tienda puede utilizar tecnologías necesarias para recordar
                preferencias y mantener funciones como el carrito de compras.
                Si se incorporan herramientas adicionales de analítica o
                publicidad, se informará sobre su uso y las opciones
                correspondientes.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                8. Modificaciones
              </h2>
              <p>
                Esta política podrá actualizarse cuando cambien nuestros
                procesos o las disposiciones legales aplicables. La versión
                vigente estará disponible en esta página.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-6">
              <p className="text-sm">
                Documento en preparación. Antes del lanzamiento comercial
                se deberán completar los datos de identificación del
                responsable del tratamiento y verificar los procedimientos
                de protección de datos de la tienda.
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
