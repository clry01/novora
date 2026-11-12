
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export const instant = false;

export default async function ComplaintsPage() {
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

  const { data: complaints, error } = await supabase
    .from("complaints_book")
    .select(`
      id,
      created_at,
      consumer_name,
      consumer_email,
      consumer_phone,
      complaint_type,
      product_service,
      order_id,
      amount,
      status
    `)
    .order("created_at", { ascending: false });

  function formatStatus(status: string) {
    const statuses: Record<string, string> = {
      received: "Recibido",
      in_review: "En revisión",
      answered: "Respondido",
    };

    return statuses[status] || status;
  }

  function statusColor(status: string) {
    const colors: Record<string, string> = {
      received: "bg-orange-100 text-orange-700",
      in_review: "bg-blue-100 text-blue-700",
      answered: "bg-green-100 text-green-700",
    };

    return colors[status] || "bg-gray-100 text-gray-700";
  }

  const total = complaints?.length ?? 0;
  const received =
    complaints?.filter((item) => item.status === "received").length ?? 0;
  const inReview =
    complaints?.filter((item) => item.status === "in_review").length ?? 0;
  const answered =
    complaints?.filter((item) => item.status === "answered").length ?? 0;

  return (
    <main className="min-h-screen bg-gray-100 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                Administración / Libro de Reclamaciones
              </p>

              <h1 className="mt-2 text-3xl font-black text-gray-900">
                Libro de Reclamaciones
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Consulta y administra los reclamos y quejas de tus clientes.
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

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total de registros
            </p>
            <p className="mt-2 text-3xl font-black text-gray-900">
              {total}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Recibidos
            </p>
            <p className="mt-2 text-3xl font-black text-orange-600">
              {received}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              En revisión
            </p>
            <p className="mt-2 text-3xl font-black text-blue-600">
              {inReview}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Respondidos
            </p>
            <p className="mt-2 text-3xl font-black text-green-600">
              {answered}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-2 border-b border-gray-100 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Todos los registros
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Historial de reclamos y quejas recibidos.
              </p>
            </div>

            <span className="w-fit rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
              {total} registros
            </span>
          </div>

          {error ? (
            <p className="py-12 text-center text-red-600">
              No se pudieron cargar los registros.
            </p>
          ) : !complaints || complaints.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-semibold text-gray-700">
                Todavía no hay reclamos ni quejas registrados.
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Cuando tus clientes envíen un registro, aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-6 py-4 font-semibold">Registro</th>
                    <th className="px-6 py-4 font-semibold">Consumidor</th>
                    <th className="px-6 py-4 font-semibold">Contacto</th>
                    <th className="px-6 py-4 font-semibold">Tipo</th>
                    <th className="px-6 py-4 font-semibold">Pedido asociado</th>
                    <th className="px-6 py-4 font-semibold">Producto / servicio</th>
                    <th className="px-6 py-4 font-semibold">Fecha</th>
                    <th className="px-6 py-4 font-semibold">Estado</th>
                    <th className="px-6 py-4 font-semibold">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className="border-t border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-5 font-bold text-gray-900">
                        #{complaint.id}
                      </td>

                      <td className="px-6 py-5 font-semibold text-gray-800">
                        {complaint.consumer_name}
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-gray-700">
                          {complaint.consumer_phone}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {complaint.consumer_email}
                        </p>
                      </td>

                      <td className="px-6 py-5 capitalize text-gray-700">
                        {complaint.complaint_type}
                      </td>

                      <td className="px-6 py-5">
                        {complaint.order_id ? (
                          <span
                            title={complaint.order_id}
                            className="font-semibold text-blue-700"
                          >
                            #{complaint.order_id.slice(0, 8)}
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            Sin asociación
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-gray-700">
                        {complaint.product_service}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-gray-500">
                        {new Date(complaint.created_at).toLocaleDateString(
                          "es-PE",
                          { timeZone: "America/Lima" }
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusColor(complaint.status)}`}
                        >
                          {formatStatus(complaint.status)}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <Link
                          href={`/admin/complaints/${complaint.id}`}
                          className="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          Ver detalle →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
