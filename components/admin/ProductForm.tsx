
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function ProductForm() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleImageChange(fileList: FileList | null) {
    setError("");

    const files = fileList ? Array.from(fileList) : [];

    if (files.length === 0) return;

    if (imageFiles.length + files.length > 5) {
      setError("Puedes seleccionar como máximo 5 imágenes en total.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError("Solo se permiten imágenes JPG, PNG o WebP.");
        return;
      }

      if (file.size === 0 || file.size > 5 * 1024 * 1024) {
        setError(
          `La imagen "${file.name}" está vacía o supera los 5 MB.`
        );
        return;
      }
    }

    setImageFiles((previous) => [...previous, ...files]);
    setImageUrl("");
  }

  function moveImage(index: number, direction: number) {
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= imageFiles.length) return;

    setImageFiles((previous) => {
      const updated = [...previous];
      [updated[index], updated[newIndex]] = [
        updated[newIndex],
        updated[index],
      ];
      return updated;
    });
  }

  function removeImage(index: number) {
    setImageFiles((previous) =>
      previous.filter((_, i) => i !== index)
    );
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (imageFiles.length === 0 && !imageUrl.trim()) {
        throw new Error("Debes seleccionar al menos una imagen o ingresar una URL.");
      }

      if (imageFiles.length > 5) {
        throw new Error("Puedes registrar como máximo 5 imágenes.");
      }

      const uploadedUrls: string[] = [];

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append("file", file);

          const uploadResponse = await fetch(
            "/api/admin/products/upload-image",
            {
              method: "POST",
              body: formData,
            }
          );

          const uploadResult = await uploadResponse.json();

          if (!uploadResponse.ok) {
            throw new Error(
              uploadResult.error || `No se pudo subir ${file.name}.`
            );
          }

          uploadedUrls.push(uploadResult.url);
        }
      } else {
        uploadedUrls.push(imageUrl.trim());
      }

      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert({
          name: name.trim(),
          slug: slug.trim(),
          category: category.trim(),
          price: Number(price),
          old_price: oldPrice ? Number(oldPrice) : null,
          stock: Number(stock),
          tag: tag.trim() || null,
          description: description.trim(),
          features: features
            .split("\n")
            .map((feature) => feature.trim())
            .filter(Boolean),
          image: uploadedUrls[0],
          is_active: true,
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      if (uploadedUrls.length > 1) {
        const additionalImages = uploadedUrls.slice(1).map(
          (url, index) => ({
            product_id: newProduct.id,
            image_url: url,
            sort_order: index + 1,
          })
        );

        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(additionalImages);

        if (imagesError) {
          throw new Error(
            `El producto se registró, pero no se pudieron guardar las imágenes adicionales: ${imagesError.message}`
          );
        }
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al registrar el producto."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Nombre</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Slug</label>
        <input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-lg border p-3"
          placeholder="nombre-del-producto"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Categoría</label>
        <input
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">Precio</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Precio anterior
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={oldPrice}
            onChange={(e) => setOldPrice(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Stock</label>
          <input
            required
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Etiqueta</label>
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="w-full rounded-lg border p-3"
          placeholder="Nuevo, Oferta, Más vendido..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border p-3"
          rows={4}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Características (una por línea)
        </label>
        <textarea
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          className="w-full rounded-lg border p-3"
          rows={4}
          placeholder={"Característica 1\nCaracterística 2\nCaracterística 3"}
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium">
          Fotografías del producto
        </label>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={imageFiles.length >= 5 || loading}
          onChange={(e) => {
            handleImageChange(e.target.files);
            e.currentTarget.value = "";
          }}
          className="w-full rounded-lg border p-3 disabled:opacity-50"
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Selecciona entre 1 y 5 fotografías. Máximo 5 MB por imagen.
          </p>
          <span className="text-sm font-medium">
            {imageFiles.length}/5
          </span>
        </div>

        {imageFiles.length > 0 && (
          <div className="space-y-3 rounded-lg border p-3">
            {imageFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {file.name}
                  </p>
                  {index === 0 ? (
                    <span className="text-xs font-semibold text-green-700">
                      ⭐ Imagen principal
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">
                      Imagen {index + 1}
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0 || loading}
                    title="Subir posición"
                    className="rounded-md border p-2 disabled:opacity-30"
                  >
                    <span aria-hidden="true">↑</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === imageFiles.length - 1 || loading}
                    title="Bajar posición"
                    className="rounded-md border p-2 disabled:opacity-30"
                  >
                    <span aria-hidden="true">↓</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={loading}
                    title="Eliminar imagen"
                    className="rounded-md border border-red-200 px-3 py-2 text-red-600 disabled:opacity-30"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-500">
          O ingresa una URL de imagen (solo una fotografía):
        </p>

        <input
          type="url"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            if (e.target.value) setImageFiles([]);
          }}
          disabled={loading}
          className="w-full rounded-lg border p-3"
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-black px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Registrando producto..." : "Registrar producto"}
      </button>
    </form>
  );
}
