
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryProducts from "@/components/home/CategoryProducts";
import BenefitsSection from "@/components/home/BenefitsSection";
import HeroSection from "@/components/home/HeroSection";

export const instant = false;

const steps = [
  {
    number: "01",
    title: "Elige tu producto",
    description:
      "Explora nuestra tienda y encuentra los productos que más te gusten.",
    icon: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
  },
  {
    number: "02",
    title: "Agrega al carrito",
    description:
      "Selecciona el producto, elige la cantidad y agrégalo a tu carrito.",
    icon: (
      <>
        <path d="M3 3h2l2.2 11.5a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.6L21 8H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
  },
  {
    number: "03",
    title: "Registra tu pedido",
    description:
      "Completa tus datos personales y la dirección donde recibirás tu compra.",
    icon: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </>
    ),
  },
  {
    number: "04",
    title: "Realiza el pago",
    description:
      "Selecciona tu medio de pago y sigue las instrucciones para realizarlo.",
    icon: (
      <>
        <rect x="2.5" y="5" width="19" height="14" rx="2" />
        <path d="M2.5 10h19M7 15h3" />
      </>
    ),
  },
  {
    number: "05",
    title: "Envía tu comprobante",
    description:
      "Envíanos tu comprobante por WhatsApp indicando el número de tu pedido.",
    icon: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20l1.2-5.3A8.5 8.5 0 1 1 21 11.5Z" />
        <path d="M8 9.5c.5 2 2 3.5 4.5 4.5l1.5-1.5 2 1" />
      </>
    ),
  },
];

export default async function Home() {
  await connection();

  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Header />

      <HeroSection />

      <BenefitsSection />

      <CategoryProducts
        products={products ?? []}
        hasError={Boolean(error)}
      />

      {/* Cómo comprar */}
      <section
        id="como-comprar"
        className="bg-gray-50 px-6 py-20 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-700">
              Compra fácil y segura
            </span>

            <h2 className="mt-4 text-3xl font-black text-gray-900 md:text-5xl">
              ¿Cómo comprar en NÓVORA?
            </h2>

            <p className="mt-5 text-sm leading-7 text-gray-500 md:text-base">
              Comprar en nuestra tienda es muy sencillo. Sigue estos cinco
              pasos y realiza tu pedido en pocos minutos.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {step.icon}
                  </svg>
                </div>

                <p className="mt-5 text-xs font-bold tracking-widest text-blue-700">
                  PASO {step.number}
                </p>

                <h3 className="mt-2 text-base font-extrabold text-gray-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Video demostrativo */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="mb-6 text-center">
              <h3 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
                Mira cómo realizar tu compra
              </h3>

              <p className="mt-3 text-sm text-gray-500">
                Te mostramos el proceso completo para comprar en NÓVORA.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-xl">
              <video
                controls
                preload="metadata"
                playsInline
                className="aspect-video w-full"
              >
                <source
                  src="/videos/como-comprar/guia-compra.mp4"
                  type="video/mp4"
                />
                Tu navegador no admite la reproducción de videos.
              </video>
            </div>
          </div>

          <div className="mt-10 text-center">
            <a
              href="#productos"
              className="inline-flex items-center justify-center rounded-full bg-blue-700 px-8 py-4 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              Explorar productos →
            </a>
          </div>
        </div>
      </section>

      {/* Confianza */}
      <section id="nosotros" className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-3xl bg-blue-700 px-8 py-16 text-center md:px-20">
          <p className="text-xs font-bold tracking-[0.25em] text-blue-200">
            UNA MEJOR FORMA DE COMPRAR
          </p>

          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-black text-white md:text-5xl">
            Lo que necesitas, en un solo lugar.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-blue-100">
            Queremos ofrecerte una experiencia de compra sencilla,
            transparente y cómoda.
          </p>

          <a
            href="#productos"
            className="mt-8 inline-block rounded-full bg-white px-8 py-4 text-sm font-bold text-blue-700 transition hover:bg-gray-100"
          >
            Descubrir productos →
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
