
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function ProductActions({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const action = isActive ? "desactivar" : "activar";

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas ${action} este producto?`
    );

    if (!confirmed) return;

    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("products")
      .update({
        is_active: !isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      alert("No se pudo actualizar el estado del producto.");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
        isActive
          ? "bg-red-50 text-red-700 hover:bg-red-100"
          : "bg-green-50 text-green-700 hover:bg-green-100"
      }`}
    >
      {loading
        ? "Actualizando..."
        : isActive
          ? "Desactivar"
          : "Activar"}
    </button>
  );
}
