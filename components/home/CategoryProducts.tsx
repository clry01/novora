
"use client";

import { useState } from "react";
import ProductCard from "@/components/products/ProductCard";

type HomeProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  old_price: number | null;
  image: string;
  tag: string | null;
  stock: number;
};

const categories = [
  { name: "Tecnología", icon: "⌘" },
  { name: "Hogar", icon: "⌂" },
  { name: "Belleza", icon: "✧" },
  { name: "Accesorios", icon: "◈" },
];

function normalizeCategory(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export default function CategoryProducts({
  products,
  hasError,
}: {
  products: HomeProduct[];
  hasError: boolean;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null
  );

  const filteredProducts = selectedCategory
    ? products.filter(
        (product) =>
          normalizeCategory(product.category) ===
          normalizeCategory(selectedCategory)
      )
    : products;

  function selectCategory(category: string | null) {
    setSelectedCategory(category);

    document.getElementById("productos")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <>
      <section id="categorias" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold tracking-[0.25em] text-blue-600">
            EXPLORA NUESTRA TIENDA
          </p>

          <h2 className="mt-3 text-3xl font-black md:text-4xl">
            Encuentra tu categoría
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            Descubre productos para diferentes momentos de tu vida.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => {
            const isSelected =
              selectedCategory === category.name;

            return (
              <button
                key={category.name}
                type="button"
                onClick={() => selectCategory(category.name)}
                className={`group rounded-2xl border p-8 text-center transition hover:-translate-y-1 ${
                  isSelected
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-blue-50"
                }`}
              >
                <span className="text-4xl text-blue-600">
                  {category.icon}
                </span>

                <h3 className="mt-4 font-bold">{category.name}</h3>

                <p className="mt-2 text-xs text-gray-500">
                  Descubrir productos →
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section id="productos" className="scroll-mt-20 bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-blue-600">
                NUESTRA SELECCIÓN
              </p>

              <h2 className="mt-3 text-3xl font-black md:text-4xl">
                {selectedCategory
                  ? `Productos de ${selectedCategory}`
                  : "Productos destacados"}
              </h2>

              <p className="mt-3 text-sm text-gray-500">
                {selectedCategory
                  ? `Mostrando productos de la categoría ${selectedCategory}.`
                  : "Una selección de productos que vale la pena descubrir."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => selectCategory(null)}
              className="text-sm font-bold text-blue-600 transition hover:text-blue-800"
            >
              Ver todo →
            </button>
          </div>

          {hasError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
              No se pudieron cargar los productos. Inténtalo nuevamente.
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => (
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
                {selectedCategory
                  ? `Todavía no hay productos disponibles en ${selectedCategory}.`
                  : "Próximamente tendremos nuevos productos."}
              </p>

              {selectedCategory && (
                <button
                  type="button"
                  onClick={() => selectCategory(null)}
                  className="mt-4 text-sm font-bold text-blue-600"
                >
                  Ver todos los productos
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
