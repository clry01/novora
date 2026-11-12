
"use client";

import { useState } from "react";
import Image from "next/image";

type ProductGalleryProps = {
  images: string[];
  productName: string;
  tag?: string | null;
};

export default function ProductGallery({
  images,
  productName,
  tag,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {/* Imagen principal */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-gray-50">
        <Image
          src={images[selectedImage]}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4 transition-opacity duration-300"
        />

        {tag && (
          <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-black tracking-wider shadow-sm">
            {tag}
          </span>
        )}
      </div>

      {/* Miniaturas debajo de la imagen principal */}
      {images.length > 1 && (
        <div className="flex w-full gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(index)}
              aria-label={`Ver fotografía ${index + 1}`}
              aria-pressed={selectedImage === index}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-gray-50 transition sm:h-24 sm:w-24 ${
                selectedImage === index
                  ? "border-blue-600"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} - fotografía ${index + 1}`}
                fill
                sizes="96px"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
