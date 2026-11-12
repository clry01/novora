
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryProducts from "@/components/home/CategoryProducts";
import BenefitsSection from "@/components/home/BenefitsSection";
import HeroSection from "@/components/home/HeroSection";

export const instant = false;

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
