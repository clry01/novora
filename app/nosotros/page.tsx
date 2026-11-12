import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function NosotrosPage() {
  return (
    <>
      <Header />

      <main className="bg-white">
        {/* Encabezado */}
        <section className="bg-gray-950 px-6 py-20 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Conócenos
            </p>

            <h1 className="text-4xl font-black md:text-5xl">
              Sobre nosotros
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-300">
              Queremos hacer que descubrir y comprar productos por internet
              sea una experiencia sencilla, cómoda y confiable.
            </p>
          </div>
        </section>

        {/* Contenido */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900">
                ¿Quiénes somos?
              </h2>

              <p className="mt-4 leading-8 text-gray-600">
                Somos una tienda online creada para acercarte productos
                de diferentes categorías en un solo lugar. Buscamos ofrecer
                una experiencia de compra práctica, con información clara
                y atención durante el proceso de compra.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900">
                Nuestra propuesta
              </h2>

              <p className="mt-4 leading-8 text-gray-600">
                Queremos que encuentres productos útiles e interesantes,
                puedas conocer sus características y realizar tus pedidos
                de manera sencilla desde cualquier dispositivo.
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Nuestro compromiso
              </h2>

              <p className="mt-4 leading-8 text-gray-600">
                Trabajamos para brindarte una atención clara y acompañarte
                desde que realizas tu pedido hasta que recibes información
                sobre su estado.
              </p>
            </div>

            <div className="mt-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                ¿Listo para descubrir nuestros productos?
              </h2>

              <Link
                href="/#productos"
                className="mt-6 inline-block rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Ver productos
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}