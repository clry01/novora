
import { redirect, notFound } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EditProductForm from "@/components/admin/EditProductForm";

export const instant = false;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;

  const supabase = await createClient();

  // Verificar sesión
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Verificar que sea administrador
  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/admin/login");
  }

  // Buscar el producto
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !product) {
    notFound();
  }

  // Buscar fotografías adicionales
  const { data: additionalImages, error: imagesError } = await supabase
    .from("product_images")
    .select("image_url, sort_order")
    .eq("product_id", product.id)
    .order("sort_order", { ascending: true });

  if (imagesError) {
    throw new Error("No se pudieron cargar las fotografías del producto.");
  }

  const images = [
    product.image,
    ...(additionalImages || []).map((item) => item.image_url),
  ].filter(Boolean);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            ← Volver a productos
          </Link>

          <h1 className="mt-5 text-3xl font-black text-gray-900">
            Editar producto
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Modifica la información de {product.name}.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <EditProductForm product={product} initialImages={images} />
        </div>
      </div>
    </main>
  );
}
