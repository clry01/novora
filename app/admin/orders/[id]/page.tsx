
import Link from "next/link";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import OrderDate from "@/components/admin/OrderDate";
import { connection } from "next/server";

export const instant = false;

type OrderPageProps = {
    params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({
    params,
}: OrderPageProps) {

    await connection();

    const { id } = await params;

    const supabase = await createClient();

    // 1. Verificar sesión
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/admin/login");
    }

    // 2. Verificar administrador
    const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (adminError || !admin) {
        redirect("/");
    }

    // 3. Consultar pedido
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (orderError || !order) {
        notFound();
    }

    // 4. Consultar productos del pedido
    const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

    // 5. Consultar reclamos asociados al pedido
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    let complaints: any[] = [];
    let complaintsError = false;

    if (!supabaseUrl || !supabaseSecretKey) {
        complaintsError = true;
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

        const { data, error } = await supabaseAdmin
            .from("complaints_book")
            .select(`
                id,
                created_at,
                consumer_name,
                document_type,
                document_number,
                consumer_address,
                consumer_email,
                consumer_phone,
                is_minor,
                representative_name,
                representative_document,
                complaint_type,
                product_service,
                amount,
                detail,
                customer_request,
                response_email,
                status,
                response,
                answered_at
            `)
            .eq("order_id", id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error consultando reclamos:", error);
            complaintsError = true;
        } else {
            complaints = data ?? [];
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

    function formatComplaintStatus(status: string) {
        const statuses: Record<string, string> = {
            received: "Recibido",
            in_review: "En revisión",
            answered: "Respondido",
        };

        return statuses[status] || status;
    }

    function complaintStatusColor(status: string) {
        const colors: Record<string, string> = {
            received: "bg-orange-100 text-orange-700",
            in_review: "bg-blue-100 text-blue-700",
            answered: "bg-green-100 text-green-700",
        };

        return colors[status] || "bg-gray-100 text-gray-700";
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6 md:p-10">
            <div className="mx-auto max-w-5xl">

                <Link
                    href="/admin/orders"
                    className="text-sm font-semibold text-blue-700 hover:underline"
                >
                    ← Volver a pedidos
                </Link>

                <header className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">
                            Detalle del pedido
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Pedido #{order.id.slice(0, 8)}
                        </p>
                    </div>

                    <div className="w-full max-w-xs">
                        <span className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${statusColor(order.status)}`}>
                            {formatStatus(order.status)}
                        </span>

                        <OrderStatusSelect
                            orderId={order.id}
                            currentStatus={order.status}
                        />
                    </div>

                </header>

                {/* Datos del cliente */}
                <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900">
                        Datos del cliente
                    </h2>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs text-gray-500">Nombre completo</p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {order.customer_first_name} {order.customer_last_name}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Celular</p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {order.customer_phone}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Correo electrónico</p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {order.customer_email}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">DNI</p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {order.customer_dni || "No proporcionado"}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Dirección de entrega */}
                <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900">
                        Dirección de entrega
                    </h2>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs text-gray-500">Departamento</p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {order.department}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Provincia</p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {order.province}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Distrito</p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {order.district}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Dirección</p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {order.address}
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-xs text-gray-500">Referencia</p>
                            <p className="mt-1 font-semibold text-gray-800">
                                {order.reference || "Sin referencia"}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Productos comprados */}
                <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900">
                        Productos del pedido
                    </h2>

                    {itemsError ? (
                        <p className="mt-6 text-sm text-red-600">
                            No se pudieron cargar los productos.
                        </p>
                    ) : !items || items.length === 0 ? (
                        <p className="mt-6 text-sm text-gray-500">
                            Este pedido no tiene productos registrados.
                        </p>
                    ) : (
                        <div className="mt-5 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b text-gray-500">
                                        <th className="pb-4 pr-4">Producto</th>
                                        <th className="pb-4 pr-4">Cantidad</th>
                                        <th className="pb-4 pr-4">Precio</th>
                                        <th className="pb-4">Subtotal</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-100">
                                            <td className="py-5 pr-4 font-semibold text-gray-800">
                                                {item.product_name}
                                            </td>

                                            <td className="py-5 pr-4 text-gray-700">
                                                {item.quantity}
                                            </td>

                                            <td className="py-5 pr-4 text-gray-700">
                                                S/ {Number(item.unit_price).toFixed(2)}
                                            </td>

                                            <td className="py-5 font-semibold text-gray-800">
                                                S/ {Number(item.line_total).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Reclamos y quejas asociados */}
                <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Reclamos y quejas asociados
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Registros del Libro de Reclamaciones vinculados a este pedido.
                            </p>
                        </div>

                        {!complaintsError && (
                            <span className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700">
                                {complaints.length}{" "}
                                {complaints.length === 1 ? "registro" : "registros"}
                            </span>
                        )}
                    </div>

                    {complaintsError ? (
                        <p className="mt-6 text-sm text-red-600">
                            No se pudieron cargar los reclamos asociados.
                        </p>
                    ) : complaints.length === 0 ? (
                        <div className="mt-5 rounded-xl bg-gray-50 p-5 text-center">
                            <p className="font-semibold text-gray-700">
                                Este pedido no tiene reclamos asociados.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6 space-y-6">
                            {complaints.map((complaint) => (
                                <article
                                    key={complaint.id}
                                    className="rounded-xl border border-gray-200 p-5"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-gray-900">
                                                {complaint.complaint_type === "reclamo"
                                                    ? "Reclamo"
                                                    : "Queja"}{" "}
                                                #{complaint.id}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Registrado el{" "}
                                                {new Date(complaint.created_at).toLocaleString("es-PE", {
                                                    timeZone: "America/Lima",
                                                })}
                                            </p>
                                        </div>

                                        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${complaintStatusColor(complaint.status)}`}>
                                            {formatComplaintStatus(complaint.status)}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Consumidor
                                            </p>
                                            <p className="mt-1 font-semibold text-gray-800">
                                                {complaint.consumer_name}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Documento
                                            </p>
                                            <p className="mt-1 font-semibold text-gray-800">
                                                {complaint.document_type} - {complaint.document_number}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Correo electrónico
                                            </p>
                                            <p className="mt-1 font-semibold text-gray-800">
                                                {complaint.consumer_email}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Teléfono
                                            </p>
                                            <p className="mt-1 font-semibold text-gray-800">
                                                {complaint.consumer_phone}
                                            </p>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <p className="text-xs text-gray-500">
                                                Dirección del consumidor
                                            </p>
                                            <p className="mt-1 font-semibold text-gray-800">
                                                {complaint.consumer_address}
                                            </p>
                                        </div>

                                        {complaint.is_minor && (
                                            <div className="sm:col-span-2">
                                                <p className="text-xs text-gray-500">
                                                    Representante del menor
                                                </p>
                                                <p className="mt-1 font-semibold text-gray-800">
                                                    {complaint.representative_name} - {complaint.representative_document}
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Producto o servicio
                                            </p>
                                            <p className="mt-1 font-semibold text-gray-800">
                                                {complaint.product_service}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Monto reclamado
                                            </p>
                                            <p className="mt-1 font-semibold text-gray-800">
                                                {complaint.amount === null
                                                    ? "No especificado"
                                                    : `S/ ${Number(complaint.amount).toFixed(2)}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 border-t border-gray-100 pt-5">
                                        <p className="text-xs font-semibold text-gray-500">
                                            Detalle del reclamo o queja
                                        </p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                                            {complaint.detail}
                                        </p>
                                    </div>

                                    <div className="mt-5">
                                        <p className="text-xs font-semibold text-gray-500">
                                            Pedido del consumidor
                                        </p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                                            {complaint.customer_request}
                                        </p>
                                    </div>

                                    <div className="mt-5 border-t border-gray-100 pt-5">
                                        <p className="text-xs text-gray-500">
                                            Correo para enviar la respuesta
                                        </p>
                                        <p className="mt-1 font-semibold text-gray-800">
                                            {complaint.response_email}
                                        </p>

                                        {complaint.response ? (
                                            <div className="mt-5 rounded-lg bg-green-50 p-4">
                                                <p className="text-sm font-bold text-green-800">
                                                    Respuesta registrada
                                                </p>
                                                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                                                    {complaint.response}
                                                </p>

                                                {complaint.answered_at && (
                                                    <p className="mt-3 text-xs text-gray-500">
                                                        Respondido el{" "}
                                                        {new Date(complaint.answered_at).toLocaleString("es-PE", {
                                                            timeZone: "America/Lima",
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="mt-3 text-sm text-orange-700">
                                                Este registro todavía no tiene una respuesta.
                                            </p>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* Resumen de pago */}
                <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900">
                        Resumen de pago
                    </h2>

                    <div className="mt-5 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-semibold text-gray-800">
                                S/ {Number(order.subtotal).toFixed(2)}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500">Envío</span>
                            <span className="font-semibold text-gray-800">
                                S/ {Number(order.shipping_cost).toFixed(2)}
                            </span>
                        </div>

                        <div className="flex justify-between border-t pt-4">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="text-xl font-black text-green-600">
                                S/ {Number(order.total).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <p className="mt-5 text-xs text-gray-400">
                        Fecha del pedido:{" "}
                        <OrderDate date={order.created_at} />
                    </p>
                </section>

            </div>
        </main>
    );
}
