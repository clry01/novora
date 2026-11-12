export const instant = false;

import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

import QuantitySelector from "@/components/products/QuantitySelector";
import ProductGallery from "@/components/products/ProductGallery";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  await connection();

  const { slug } = await params;

  const supabase = await createClient();

  // Buscar el producto activo en Supabase.
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !product) {
    notFound();
  }

  // Buscar las fotografías adicionales del producto.
  const { data: additionalImages } = await supabase
    .from("product_images")
    .select("image_url, sort_order")
    .eq("product_id", product.id)
    .order("sort_order", { ascending: true });

  // La imagen principal siempre viene de products.image.
  const images = [
    product.image,
    ...(additionalImages || []).map((image) => image.image_url),
  ].filter(Boolean);

  // Adaptar los precios al formato de la tienda.
  const price = `S/ ${Number(product.price).toFixed(2)}`;

  const oldPrice =
    product.old_price !== null
      ? `S/ ${Number(product.old_price).toFixed(2)}`
      : "";

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navegación */}
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#172A3A] text-lg font-black text-white">
              N
            </span>
            <span className="text-2xl font-black tracking-tight text-[#172A3A]">
              ÓVORA<span className="text-blue-600">.</span>
            </span>
          </Link>

          <Link
            href="/"
            className="text-sm font-semibold text-gray-600 transition hover:text-blue-600"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </header>

      {/* Información del producto */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        {/* Galería de fotografías */}
        <ProductGallery
          images={images}
          productName={product.name}
          tag={product.tag}
        />

        {/* Datos del producto */}
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
            {product.category}
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
            {product.name}
          </h1>

          <div className="mt-7 flex items-center gap-4">
            <span className="text-3xl font-black text-blue-700">
              {price}
            </span>

            {oldPrice && (
              <span className="text-lg text-gray-400 line-through">
                {oldPrice}
              </span>
            )}
          </div>

          <p className="mt-7 leading-7 text-gray-600">
            {product.description}
          </p>

          <div className="mt-8 border-y border-gray-100 py-6">
            <h2 className="mb-4 font-bold text-gray-900">
              Características del producto
            </h2>

            <ul className="space-y-3">
              {(product.features || []).map(
                (feature: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-600"
                  >
                    <span className="font-bold text-green-600">✓</span>
                    {feature}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Selector de cantidad y botón de compra */}
          <QuantitySelector
            slug={product.slug}
            price={price}
            stock={product.stock}
          />
        </div>
      </section>
    </main>
  );
}