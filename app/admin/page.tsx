import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import OrderDate from "@/components/admin/OrderDate";
import { connection } from "next/server";

export const instant = false;

export default function AdminPage() {
  
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-gray-500">
            Cargando panel administrativo...
          </p>
        </div>
      }
    >
      <AdminDashboardData />
    </Suspense>
  );
}

async function AdminDashboardData() {
  await connection();
  const supabase = await createClient();

  // 1. Verificar sesión
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // 2. Verificar rol de administrador
  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !admin) {
    redirect("/");
  }

  // 3. Obtener datos para indicadores
  const { data: allOrders, error: statsError } = await supabase
    .from("orders")
    .select("id, status, total");

  // 4. Obtener últimos 8 pedidos
  const { data: recentOrders, error: ordersError } = await supabase
    .from("orders")
    .select(`
      id,
      customer_first_name,
      customer_last_name,
      created_at,
      total,
      status
    `)
    .order("created_at", { ascending: false })
    .limit(8);

  const orders = allOrders ?? [];

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const confirmedOrders = orders.filter(
    (order) => order.status === "confirmed"
  ).length;

  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  function formatStatus(status: string) {
    const statuses: Record<string, string> = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };

    return statuses[status] || status;
  }

  function statusColor(status: string) {
    const colors: Record<string, string> = {
      pending: "bg-orange-100 text-orange-700",
      confirmed: "bg-blue-100 text-blue-700",
      shipped: "bg-purple-100 text-purple-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };

    return colors[status] || "bg-gray-100 text-gray-700";
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      {/* ENCABEZADO */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900">
            Resumen
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Bienvenido al panel de administración.
          </p>
        </div>

        <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm">
          Administrador
        </span>
      </header>

      {statsError && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          No se pudieron cargar los indicadores de pedidos.
        </p>
      )}

      {/* INDICADORES */}
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Pedidos totales</p>
          <p className="mt-3 text-3xl font-black text-gray-900">
            {totalOrders}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="mt-3 text-3xl font-black text-orange-500">
            {pendingOrders}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Confirmados</p>
          <p className="mt-3 text-3xl font-black text-blue-600">
            {confirmedOrders}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Ventas registradas</p>
          <p className="mt-3 text-3xl font-black text-green-600">
            S/ {totalSales.toFixed(2)}
          </p>
        </div>
      </div>

      {/* PEDIDOS RECIENTES */}
      <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            Pedidos recientes
          </h3>

          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            Ver todos los pedidos
          </Link>
        </div>

        <div className="mt-8 overflow-x-auto">
          {ordersError ? (
            <p className="py-10 text-center text-red-500">
              No se pudieron cargar los pedidos.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="pb-4 pr-4">Pedido</th>
                  <th className="pb-4 pr-4">Cliente</th>
                  <th className="pb-4 pr-4">Fecha</th>
                  <th className="pb-4 pr-4">Total</th>
                  <th className="pb-4">Estado</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100"
                    >
                      <td className="py-5 pr-5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          #{order.id.slice(0, 8)}
                        </Link>
                      </td>

                      <td className="py-5 pr-4 text-gray-700">
                        {order.customer_first_name}{" "}
                        {order.customer_last_name}
                      </td>

                      <td className="py-5 pr-4 text-gray-500">
                        <OrderDate date={order.created_at} />
                      </td>

                      <td className="py-5 pr-4 font-semibold text-gray-800">
                        S/ {Number(order.total).toFixed(2)}
                      </td>

                      <td className="py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(order.status)}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-gray-400"
                    >
                      Todavía no hay pedidos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}