
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

type OrderStatusSelectProps = {
  orderId: string;
  currentStatus: string;
};

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleChange(newStatus: string) {
    if (newStatus === status) return;

    const confirmed = window.confirm(
      "¿Deseas cambiar el estado de este pedido? Esta acción también puede modificar el inventario."
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.rpc(
      "update_order_status_with_stock",
      {
        p_order_id: orderId,
        p_new_status: newStatus,
      }
    );

    if (error) {
      setMessage(error.message || "No se pudo actualizar el pedido.");
      setLoading(false);
      return;
    }

    setStatus(newStatus);
    setMessage("Estado actualizado correctamente. Inventario actualizado.");

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-5">
      <label className="block text-sm font-semibold text-gray-700">
        Cambiar estado del pedido
      </label>

      <select
        value={status}
        onChange={(event) => handleChange(event.target.value)}
        disabled={loading}
        className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-800 outline-none focus:border-blue-600 disabled:opacity-50"
      >
        <option value="pending">Pendiente</option>
        <option value="confirmed">Confirmado</option>
        <option value="shipped">Enviado</option>
        <option value="delivered">Entregado</option>
        <option value="cancelled">Cancelado</option>
      </select>

      {loading && (
        <p className="mt-2 text-sm text-gray-500">
          Actualizando...
        </p>
      )}

      {message && (
        <p className="mt-2 text-sm text-green-600">
          {message}
        </p>
      )}
    </div>
  );
}
