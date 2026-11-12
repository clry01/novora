
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { createClient } from "@/lib/supabase/browser";

type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  is_active: boolean;
};

export default function CartContent() {
  const { items, updateQuantity, removeFromCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);

      const supabase = createClient();

      const slugs = [...new Set(items.map((item) => item.slug))];

      if (slugs.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("slug, name, category, price, image, stock, is_active")
        .in("slug", slugs)
        .eq("is_active", true);

      if (error) {
        console.error("Error cargando productos del carrito:", error);
        setProducts([]);
      } else {
        setProducts(data ?? []);
      }

      setLoading(false);
    }

    loadProducts();
  }, [items]);

  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p.slug === item.slug);

    if (!product) return sum;

    return sum + Number(product.price) * item.quantity;
  }, 0);

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <Link href="/" className="text-sm font-semibold text-blue-700">
            ← Seguir comprando
          </Link>

          <h1 className="mt-5 text-3xl font-black text-gray-900">
            Mi carrito
          </h1>

          <p className="mt-2 text-gray-500">
            Revisa los productos que seleccionaste.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-bold">Tu carrito está vacío</h2>

            <p className="mt-3 text-gray-500">
              Explora nuestra tienda y encuentra algo que te guste.
            </p>

            <Link
              href="/"
              className="mt-7 inline-block rounded-full bg-blue-700 px-8 py-3 font-bold text-white hover:bg-blue-800"
            >
              Explorar productos
            </Link>
          </div>
        ) : loading ? (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-500">
            Cargando productos del carrito...
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              {items.map((item) => {
                const product = products.find(
                  (p) => p.slug === item.slug
                );

                if (!product) {
                  return (
                    <article
                      key={item.slug}
                      className="rounded-2xl bg-white p-5 shadow-sm"
                    >
                      <p className="font-semibold text-gray-800">
                        Producto no disponible
                      </p>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.slug)}
                        className="mt-3 text-sm font-semibold text-red-500"
                      >
                        Eliminar del carrito
                      </button>
                    </article>
                  );
                }

                const price = Number(product.price);
                const subtotal = price * item.quantity;
                const reachedStock = item.quantity >= product.stock;

                return (
                  <article
                    key={item.slug}
                    className="grid grid-cols-1 gap-5 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-[112px_minmax(0,1fr)_130px] sm:items-center"
                  >
                    <div className="relative h-28 w-28 overflow-hidden rounded-xl bg-gray-100">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex min-w-0 flex-col justify-center">
                      <p className="text-sm text-gray-400">
                        {product.category}
                      </p>

                      <h2 className="mt-1 text-lg font-bold text-gray-900">
                        {product.name}
                      </h2>

                      <p className="mt-2 font-bold text-blue-700">
                        S/ {price.toFixed(2)}
                      </p>

                      <p className="mt-2 text-xs font-semibold text-gray-500">
                        Stock disponible: {product.stock} unidades
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <div className="flex items-center overflow-hidden rounded-full border border-gray-200">
                          <button
                            type="button"
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              updateQuantity(item.slug, item.quantity - 1)
                            }
                            className="px-4 py-2 hover:bg-gray-100 disabled:opacity-30"
                          >
                            −
                          </button>

                          <span className="min-w-10 text-center font-bold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            disabled={reachedStock}
                            onClick={() =>
                              updateQuantity(item.slug, item.quantity + 1)
                            }
                            className="px-4 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.slug)}
                          className="text-sm font-semibold text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>

                      {reachedStock && product.stock > 0 && (
                        <p className="mt-2 text-xs font-semibold text-orange-600">
                          Has alcanzado el stock máximo disponible.
                        </p>
                      )}

                      {product.stock <= 0 && (
                        <p className="mt-2 text-xs font-semibold text-red-600">
                          Producto agotado.
                        </p>
                      )}

                      {item.quantity > product.stock && (
                        <p className="mt-2 text-xs font-semibold text-red-600">
                          La cantidad de tu carrito supera el stock actual.
                          Reduce las unidades para continuar.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col justify-center border-t border-gray-100 pt-4 sm:border-t-0 sm:pt-0 sm:text-right">
                      <p className="text-sm text-gray-400">Subtotal</p>

                      <p className="mt-1 text-xl font-black text-gray-900">
                        S/ {subtotal.toFixed(2)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-6">
              <h2 className="text-xl font-black text-gray-900">
                Resumen de compra
              </h2>

              <div className="mt-6 flex justify-between text-gray-500">
                <span>Productos</span>

                <span className="font-semibold text-gray-900">
                  {totalItems}
                </span>
              </div>

              <div className="mt-5 flex justify-between border-t border-gray-100 pt-5">
                <span className="font-bold text-gray-900">Total</span>

                <span className="text-xl font-black text-blue-700">
                  S/ {total.toFixed(2)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-7 block rounded-full bg-blue-700 px-6 py-4 text-center font-bold text-white transition hover:bg-blue-800"
              >
                Continuar compra
              </Link>

              <p className="mt-4 text-center text-xs text-gray-400">
                Los costos de envío se calcularán posteriormente.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
