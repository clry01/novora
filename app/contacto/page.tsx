
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const whatsappNumber = "51993521888";
const whatsappMessage = encodeURIComponent(
  "Hola, quisiera realizar una consulta sobre sus productos."
);

export default function ContactoPage() {
  return (
    <>
      <Header />

      <main className="bg-white">
        <section className="bg-gray-950 px-6 py-20 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Estamos para ayudarte
            </p>

            <h1 className="text-4xl font-black md:text-5xl">
              Contáctanos
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-300">
              ¿Tienes alguna consulta sobre nuestros productos o tu pedido?
              Escríbenos y con gusto te atenderemos.
            </p>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
                💬
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                Atención por WhatsApp
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                Comunícate directamente con nosotros para resolver tus dudas
                sobre productos, compras o pedidos.
              </p>

              <p className="mt-5 font-semibold text-gray-900">
                +51 993 521 888
              </p>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                Escribir por WhatsApp
              </a>
            </div>

            <div className="rounded-2xl border border-gray-200 p-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
                📦
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                Consulta tu pedido
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                Si ya realizaste una compra, puedes consultar el estado de
                tu pedido desde el enlace de seguimiento que recibiste.
              </p>

              <p className="mt-5 text-sm text-gray-500">
                ¿Necesitas ayuda con tu compra? Escríbenos por WhatsApp.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/#productos"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              ← Volver a la tienda
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
