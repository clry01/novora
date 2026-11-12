
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

type Product = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
};

export default function HeroProductCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function loadProducts() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, image, price")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setProducts(data);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((previous) => (previous + 1) % products.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [products.length]);

  if (products.length === 0) {
    return (
      <div className="h-80 rounded-3xl bg-gray-900 md:h-[450px]" />
    );
  }

  const product = products[current];

  return (
    //<div className="relative h-80 overflow-hidden rounded-3xl bg-[#172033] p-3 shadow-2xl md:h-[450px] md:p-5">
    <div className="relative h-[470px] overflow-visible bg-transparent md:h-[580px]">
      <Link
        href={`/products/${product.slug}`}
        className="flex h-full flex-col items-center justify-center gap-3"
      >

        {/* Contenedor */}
        <div className="relative z-0 h-full min-h-0 w-full flex-1 overflow-hidden rounded-2xl bg-gray-900">
          {/* Fondo que cubre todo el carrusel */}
          <Image
            src={product.image}
            alt=""
            fill
            aria-hidden="true"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="scale-125 object-cover object-center blur-xl opacity-100"
          />

          {/* Imagen principal completa */}
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="z-10 object-contain object-center transition-opacity duration-500"
          />
        </div>

        {/* Información del producto */}
        <div className="w-full text-center">
          <h3 className="truncate text-lg font-bold text-white">
            {product.name}
          </h3>

          <p className="mt-1 text-xl font-black text-blue-400">
            S/ {Number(product.price).toFixed(2)}
          </p>
        </div>
      </Link>

      {/* Flechas */}
      {products.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              setCurrent((previous) =>
                (previous - 1 + products.length) % products.length
              )
            }
            aria-label="Producto anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-900 shadow transition hover:bg-white"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() =>
              setCurrent((previous) => (previous + 1) % products.length)
            }
            aria-label="Producto siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-900 shadow transition hover:bg-white"
          >
            →
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-[-14] left-0 z-20 flex w-full justify-center gap-2">
            {products.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Ver producto ${index + 1}`}
                className={`h-2 rounded-full transition-all ${current === index
                  ? "w-6 bg-blue-400"
                  : "w-2 bg-white/50"
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
