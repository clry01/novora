
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { connection } from "next/server";

export const instant = false;

export default async function OrdersPage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !admin) {
    redirect("/");
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      customer_first_name,
      customer_last_name,
      customer_phone,
      customer_email,
      created_at,
      total,
      status
    `)
    .order("created_at", { ascending: false });

  // Consultar los reclamos asociados a los pedidos.
  // Esta consulta se realiza en el servidor después de verificar al administrador.
  const complaintsByOrder = new Map<string, number>();
  let complaintsUnavailable = false;

  if (orders && orders.length > 0) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      complaintsUnavailable = true;
    } else {
      const supabaseAdmin = createSupabaseClient(
        supabaseUrl,
        supabaseSecretKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

      const orderIds = orders.map((order) => order.id);

      const { data: complaints, error: complaintsError } =
        await supabaseAdmin
          .from("complaints_book")
          .select("order_id")
          .in("order_id", orderIds);

      if (complaintsError) {
        console.error(
          "Error consultando reclamos de pedidos:",
          complaintsError
        );
        complaintsUnavailable = true;
      } else {
        for (const complaint of complaints ?? []) {
          if (complaint.order_id) {
            const currentCount =
              complaintsByOrder.get(complaint.order_id) ?? 0;

            complaintsByOrder.set(
              complaint.order_id,
              currentCount + 1
            );
          }
        }
      }
    }
  }

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
    <main className="min-h-screen bg-gray-100 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">

        <header className="mb-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                Administración / Pedidos
              </p>

              <h1 className="mt-2 text-3xl font-black text-gray-900">
                Pedidos
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Consulta y administra las compras de tus clientes.
              </p>
            </div>

            <Link
              href="/admin"
              className="inline-flex w-fit items-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              ← Volver al resumen
            </Link>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total de pedidos
            </p>

            <p className="mt-2 text-3xl font-black text-gray-900">
              {orders?.length ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Pedidos pendientes
            </p>

            <p className="mt-2 text-3xl font-black text-orange-600">
              {orders?.filter((order) => order.status === "pending").length ?? 0}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-2 border-b border-gray-100 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Todos los pedidos
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Historial de compras registradas en la tienda.
              </p>
            </div>

            <span className="w-fit rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
              {orders?.length ?? 0} pedidos
            </span>
          </div>

          {error ? (
            <p className="py-12 text-center text-red-600">
              No se pudieron cargar los pedidos.
            </p>
          ) : !orders || orders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-semibold text-gray-700">
                Todavía no hay pedidos registrados.
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Cuando tus clientes realicen compras, aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-6 py-4 font-semibold">Pedido</th>
                    <th className="px-6 py-4 font-semibold">Cliente</th>
                    <th className="px-6 py-4 font-semibold">Contacto</th>
                    <th className="px-6 py-4 font-semibold">Fecha</th>
                    <th className="px-6 py-4 font-semibold">Total</th>
                    <th className="px-6 py-4 font-semibold">Estado</th>
                    <th className="px-6 py-4 font-semibold">Reclamos</th>
                    <th className="px-6 py-4 font-semibold">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    const complaintCount =
                      complaintsByOrder.get(order.id) ?? 0;

                    return (
                      <tr
                        key={order.id}
                        className="border-t border-gray-100 transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-5">
                          <span className="font-bold text-gray-900">
                            #{order.id.slice(0, 8)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-semibold text-gray-800">
                            {order.customer_first_name}{" "}
                            {order.customer_last_name}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-gray-700">
                            {order.customer_phone}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {order.customer_email}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-gray-500">
                          {new Date(order.created_at).toLocaleDateString("es-PE")}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 font-bold text-gray-900">
                          S/ {Number(order.total).toFixed(2)}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusColor(order.status)}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          {complaintsUnavailable ? (
                            <span className="text-xs text-gray-400">
                              No disponible
                            </span>
                          ) : complaintCount > 0 ? (
                            <span className="inline-flex rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700">
                              {complaintCount}{" "}
                              {complaintCount === 1 ? "reclamo" : "reclamos"}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Sin reclamos
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            Ver detalle →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
