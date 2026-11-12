
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/products/ProductCard";

export default async function ProductsSection() {
  await connection();

  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <section id="productos" className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-blue-600">
              NUESTRA SELECCIÓN
            </p>

            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              Productos destacados
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Una selección de productos que vale la pena descubrir.
            </p>
          </div>

          <a href="#productos" className="text-sm font-bold text-blue-600">
            Ver todo →
          </a>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            No se pudieron cargar los productos. Inténtalo nuevamente.
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name}
                category={product.category}
                price={`S/ ${Number(product.price).toFixed(2)}`}
                oldPrice={
                  product.old_price !== null
                    ? `S/ ${Number(product.old_price).toFixed(2)}`
                    : ""
                }
                image={product.image}
                tag={product.tag ?? ""}
                stock={product.stock}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white p-10 text-center">
            <p className="font-semibold text-gray-700">
              Próximamente tendremos nuevos productos.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
