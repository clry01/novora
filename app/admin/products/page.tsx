
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductActions from "@/components/admin/ProductActions";

export const instant = false;

export default async function ProductsPage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/admin/login");
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Productos
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Administra el catálogo de tu tienda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-white px-5 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Total de productos
              </p>
              <p className="mt-1 text-2xl font-black text-gray-900">
                {products?.length ?? 0}
              </p>
            </div>

            <Link
              href="/admin/products/new"
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              + Agregar producto
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            No se pudieron cargar los productos. Verifica la conexión con Supabase.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4">Precio</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {products?.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {product.category}
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-900">
                        S/ {Number(product.price).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {product.stock}
                      </td>

                      <td className="px-6 py-4">
                        {product.is_active ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Activo
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            Inactivo
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="font-semibold text-blue-700 hover:text-blue-900"
                          >
                            Editar
                          </Link>

                          <ProductActions
                            productId={product.id}
                            isActive={product.is_active}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}

                  {(!products || products.length === 0) && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Todavía no hay productos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
