
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  old_price: number | null;
  image: string;
  tag: string | null;
  description: string;
  features: string[];
  stock: number;
  is_active: boolean;
};

type GalleryItem = {
  id: string;
  url?: string;
  file?: File;
  preview: string;
};

export default function EditProductForm({
  product,
  initialImages,
}: {
  product: Product;
  initialImages: string[];
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: String(product.price),
    old_price:
      product.old_price !== null ? String(product.old_price) : "",
    tag: product.tag ?? "",
    description: product.description,
    features: (product.features || []).join("\n"),
    stock: String(product.stock),
    is_active: product.is_active,
  });

  const [images, setImages] = useState<GalleryItem[]>(
    initialImages.map((url, index) => ({
      id: `existing-${index}`,
      url,
      preview: url,
    }))
  );

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleAddImages(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    if (images.length + files.length > 5) {
      setMessage("Puedes tener un máximo de 5 fotografías por producto.");
      event.target.value = "";
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setMessage("Solo se permiten imágenes JPG, PNG o WebP.");
        event.target.value = "";
        return;
      }

      if (file.size === 0 || file.size > 5 * 1024 * 1024) {
        setMessage("Cada fotografía debe pesar como máximo 5 MB.");
        event.target.value = "";
        return;
      }
    }

    const newImages = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((previous) => [...previous, ...newImages]);
    setMessage("");
    event.target.value = "";
  }

  function removeImage(index: number) {
    setImages((previous) => {
      const item = previous[index];

      if (item.file) {
        URL.revokeObjectURL(item.preview);
      }

      return previous.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= images.length) return;

    setImages((previous) => {
      const updated = [...previous];
      [updated[index], updated[newIndex]] = [
        updated[newIndex],
        updated[index],
      ];
      return updated;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (images.length === 0) {
      setMessage("El producto debe tener al menos una fotografía.");
      setLoading(false);
      return;
    }

    if (images.length > 5) {
      setMessage("Puedes tener un máximo de 5 fotografías.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      // Subir las fotografías nuevas a Supabase Storage.
      const finalImages: string[] = [];

      for (const item of images) {
        if (item.file) {
          const uploadForm = new FormData();
          uploadForm.append("file", item.file);

          const response = await fetch(
            "/api/admin/products/upload-image",
            {
              method: "POST",
              body: uploadForm,
            }
          );

          const result = await response.json();

          if (!response.ok || !result.url) {
            throw new Error(
              result.error || "No se pudo subir una fotografía."
            );
          }

          finalImages.push(result.url);
        } else if (item.url) {
          finalImages.push(item.url);
        }
      }

      // Actualizar los datos del producto y su fotografía principal.
      const { data, error } = await supabase
        .from("products")
        .update({
          name: form.name.trim(),
          slug: form.slug.trim(),
          category: form.category.trim(),
          price: Number(form.price),
          old_price: form.old_price ? Number(form.old_price) : null,
          image: finalImages[0],
          tag: form.tag.trim() || null,
          description: form.description.trim(),
          features: form.features
            .split("\n")
            .map((feature) => feature.trim())
            .filter(Boolean),
          stock: Number(form.stock),
          is_active: form.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id)
        .select("id")
        .maybeSingle();

      if (error || !data) {
        if (error?.code === "23505") {
          throw new Error("Ya existe otro producto con ese enlace (slug).");
        }

        throw new Error("No se pudo actualizar la información del producto.");
      }

      // Eliminar las fotografías adicionales anteriores.
      const { error: deleteError } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", product.id);

      if (deleteError) {
        throw new Error(
          "Se actualizaron los datos, pero no se pudieron actualizar las fotografías adicionales. Revisa los permisos de Supabase."
        );
      }

      // Registrar nuevamente las fotografías secundarias.
      if (finalImages.length > 1) {
        const additionalImages = finalImages.slice(1).map((url, index) => ({
          product_id: product.id,
          image_url: url,
          sort_order: index + 1,
        }));

        const { error: insertError } = await supabase
          .from("product_images")
          .insert(additionalImages);

        if (insertError) {
          throw new Error(
            "Se actualizó el producto, pero no se pudieron guardar las fotografías adicionales."
          );
        }
      }
      setLoading(false);
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al actualizar el producto."
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Nombre del producto *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-800 outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Enlace del producto (slug) *
          </label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            pattern="[a-z0-9-]+"
            title="Usa letras minúsculas, números y guiones."
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-800 outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Categoría *
          </label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-800 outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Precio de venta (S/) *
          </label>
          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-800 outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Precio anterior (S/)
          </label>
          <input
            name="old_price"
            type="number"
            min="0"
            step="0.01"
            value={form.old_price}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-800 outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Stock disponible
          </label>
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-800 outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Etiqueta del producto
          </label>
          <input
            name="tag"
            value={form.tag}
            onChange={handleChange}
            placeholder="Ej. OFERTA o MÁS VENDIDO"
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-800 outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Galería de fotografías */}
      <div className="border-t border-gray-100 pt-6">
        <div className="mb-3">
          <h2 className="font-bold text-gray-900">
            Fotografías del producto
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Agrega entre 1 y 5 fotografías. La primera será la imagen principal.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {images.map((item, index) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <div className="relative aspect-square bg-gray-50">
                <img
                  src={item.preview}
                  alt={`Fotografía ${index + 1}`}
                  className="h-full w-full object-contain p-2"
                />

                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded-md bg-blue-700 px-2 py-1 text-[10px] font-bold text-white">
                    PRINCIPAL
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 border-t border-gray-100 p-2">
                <button
                  type="button"
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0 || loading}
                  className="rounded-md px-2 py-1 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                  aria-label="Mover fotografía a la izquierda"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={() => moveImage(index, 1)}
                  disabled={index === images.length - 1 || loading}
                  className="rounded-md px-2 py-1 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                  aria-label="Mover fotografía a la derecha"
                >
                  →
                </button>

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={loading}
                  className="rounded-md px-2 py-1 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-30"
                  aria-label="Eliminar fotografía"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {images.length < 5 && (
          <div className="mt-4">
            <label className="inline-flex cursor-pointer items-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100">
              + Agregar fotografías
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleAddImages}
                disabled={loading}
                className="hidden"
              />
            </label>
            <p className="mt-2 text-xs text-gray-400">
              Puedes agregar {5 - images.length} fotografía(s) más. JPG, PNG
              o WebP. Máximo 5 MB por imagen.
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Descripción *
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-800 outline-none focus:border-blue-600"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Características
        </label>
        <textarea
          name="features"
          value={form.features}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-800 outline-none focus:border-blue-600"
        />
        <p className="mt-1 text-xs text-gray-400">
          Escribe una característica por línea.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Estado del producto
        </label>
        <select
          name="is_active"
          value={String(form.is_active)}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              is_active: event.target.value === "true",
            }))
          }
          className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-800 outline-none focus:border-blue-600"
        >
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      </div>

      {message && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Actualizando..." : "Guardar cambios"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          disabled={loading}
          className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
