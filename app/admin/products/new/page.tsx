
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
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
            Agregar producto
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Completa la información para registrar un nuevo producto en tu tienda.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <ProductForm />
        </div>
      </div>
    </main>
  );
}
