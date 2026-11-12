
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type FormData = {
  consumer_name: string;
  document_type: string;
  document_number: string;
  consumer_address: string;
  consumer_email: string;
  consumer_phone: string;
  is_minor: boolean;
  representative_name: string;
  representative_document: string;
  complaint_type: string;
  order_id: string;
  product_service: string;
  amount: string;
  detail: string;
  customer_request: string;
};

const initialForm: FormData = {
  consumer_name: "",
  document_type: "DNI",
  document_number: "",
  consumer_address: "",
  consumer_email: "",
  consumer_phone: "",
  is_minor: false,
  representative_name: "",
  representative_document: "",
  complaint_type: "reclamo",
  order_id: "",
  product_service: "",
  amount: "",
  detail: "",
  customer_request: "",
};

export default function LibroDeReclamacionesPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    complaintId: number;
    emailSent: boolean;
  } | null>(null);

  function updateField<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(null);

    if (
      form.is_minor &&
      (!form.representative_name.trim() ||
        !form.representative_document.trim())
    ) {
      setError("Completa los datos del representante del menor.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          order_id: form.order_id.trim() || null,
          amount: form.amount.trim() === "" ? null : Number(form.amount),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "No se pudo registrar el reclamo."
        );
      }

      setSuccess({
        complaintId: result.complaintId,
        emailSent: result.emailSent,
      });

      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al enviar el formulario."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass = "block text-sm font-semibold text-gray-700";

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="mb-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Volver a la tienda
          </Link>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="bg-gray-950 px-6 py-8 text-white sm:px-10">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">
                Atención al consumidor
              </p>

              <h1 className="mt-2 text-3xl font-black">
                Libro de Reclamaciones
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-300">
                Registra aquí tu reclamo o queja sobre nuestros productos
                o servicios. Completa los datos solicitados.
              </p>
            </div>

            <div className="p-6 sm:p-10">
              {success ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-6">
                  <h2 className="text-xl font-bold text-green-800">
                    ¡Registro recibido!
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-green-800">
                    Tu registro fue guardado correctamente.
                  </p>

                  <p className="mt-2 text-sm font-bold text-green-900">
                    Número de registro: #{success.complaintId}
                  </p>

                  <p className="mt-3 text-sm text-green-800">
                    {success.emailSent
                      ? "Te enviamos una copia a tu correo electrónico."
                      : "No pudimos enviar la copia por correo. Conserva tu número de registro."}
                  </p>

                  <button
                    type="button"
                    onClick={() => setSuccess(null)}
                    className="mt-6 rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800"
                  >
                    Registrar otro reclamo
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <section>
                    <h2 className="text-lg font-bold text-gray-900">
                      1. Identificación del consumidor
                    </h2>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <label className={labelClass}>
                        Nombre completo *
                        <input
                          className={inputClass}
                          value={form.consumer_name}
                          onChange={(e) =>
                            updateField("consumer_name", e.target.value)
                          }
                          maxLength={200}
                          required
                        />
                      </label>

                      <label className={labelClass}>
                        Tipo de documento *
                        <select
                          className={inputClass}
                          value={form.document_type}
                          onChange={(e) =>
                            updateField("document_type", e.target.value)
                          }
                          required
                        >
                          <option value="DNI">DNI</option>
                          <option value="CE">Carné de extranjería</option>
                          <option value="Pasaporte">Pasaporte</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </label>

                      <label className={labelClass}>
                        Número de documento *
                        <input
                          className={inputClass}
                          value={form.document_number}
                          onChange={(e) =>
                            updateField("document_number", e.target.value)
                          }
                          maxLength={30}
                          required
                        />
                      </label>

                      <label className={labelClass}>
                        Teléfono *
                        <input
                          className={inputClass}
                          type="tel"
                          value={form.consumer_phone}
                          onChange={(e) =>
                            updateField("consumer_phone", e.target.value)
                          }
                          maxLength={30}
                          required
                        />
                      </label>

                      <label className={`${labelClass} sm:col-span-2`}>
                        Domicilio *
                        <input
                          className={inputClass}
                          value={form.consumer_address}
                          onChange={(e) =>
                            updateField("consumer_address", e.target.value)
                          }
                          maxLength={500}
                          required
                        />
                      </label>

                      <label className={`${labelClass} sm:col-span-2`}>
                        Correo electrónico *
                        <input
                          className={inputClass}
                          type="email"
                          value={form.consumer_email}
                          onChange={(e) =>
                            updateField("consumer_email", e.target.value)
                          }
                          maxLength={254}
                          required
                        />
                      </label>
                    </div>

                    <label className="mt-5 flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.is_minor}
                        onChange={(e) =>
                          updateField("is_minor", e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      El consumidor es menor de edad.
                    </label>

                    {form.is_minor && (
                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <label className={labelClass}>
                          Nombre del padre, madre o representante *
                          <input
                            className={inputClass}
                            value={form.representative_name}
                            onChange={(e) =>
                              updateField("representative_name", e.target.value)
                            }
                            required
                          />
                        </label>

                        <label className={labelClass}>
                          Documento del representante *
                          <input
                            className={inputClass}
                            value={form.representative_document}
                            onChange={(e) =>
                              updateField(
                                "representative_document",
                                e.target.value
                              )
                            }
                            required
                          />
                        </label>
                      </div>
                    )}
                  </section>

                  <section>
                    <h2 className="text-lg font-bold text-gray-900">
                      2. Información del reclamo o queja
                    </h2>

                    <div className="mt-5 space-y-5">
                      <label className={labelClass}>
                        Tipo de registro *
                        <select
                          className={inputClass}
                          value={form.complaint_type}
                          onChange={(e) =>
                            updateField("complaint_type", e.target.value)
                          }
                        >
                          <option value="reclamo">Reclamo</option>
                          <option value="queja">Queja</option>
                        </select>
                      </label>

                      <p className="text-xs leading-5 text-gray-500">
                        Reclamo: disconformidad relacionada con un producto
                        o servicio. Queja: disconformidad relacionada con
                        la atención al público.
                      </p>

                      <div>
                        <label className={labelClass}>
                          Número de pedido (opcional)
                          <input
                            className={inputClass}
                            value={form.order_id}
                            onChange={(e) =>
                              updateField("order_id", e.target.value)
                            }
                            maxLength={36}
                            placeholder="Pega aquí el número de tu pedido"
                          />
                        </label>

                        <p className="mt-2 text-xs leading-5 text-gray-500">
                          Puedes encontrarlo en el correo de confirmación
                          de tu compra, donde aparece como Número de pedido.
                          Si tu reclamo no está relacionado con una compra,
                          puedes dejar este campo vacío.
                        </p>
                      </div>

                      <label className={labelClass}>
                        Producto o servicio *
                        <input
                          className={inputClass}
                          value={form.product_service}
                          onChange={(e) =>
                            updateField("product_service", e.target.value)
                          }
                          maxLength={300}
                          required
                        />
                      </label>

                      <label className={labelClass}>
                        Monto reclamado (S/)
                        <input
                          className={inputClass}
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.amount}
                          onChange={(e) =>
                            updateField("amount", e.target.value)
                          }
                        />
                      </label>

                      <label className={labelClass}>
                        Detalle del reclamo o queja *
                        <textarea
                          className={inputClass}
                          rows={5}
                          value={form.detail}
                          onChange={(e) =>
                            updateField("detail", e.target.value)
                          }
                          maxLength={10000}
                          required
                        />
                      </label>

                      <label className={labelClass}>
                        ¿Qué solución solicitas? *
                        <textarea
                          className={inputClass}
                          rows={4}
                          value={form.customer_request}
                          onChange={(e) =>
                            updateField("customer_request", e.target.value)
                          }
                          maxLength={5000}
                          required
                        />
                      </label>
                    </div>
                  </section>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                      {error}
                    </div>
                  )}

                  <div className="rounded-xl bg-gray-50 p-4 text-xs leading-6 text-gray-600">
                    Al enviar este formulario, declaras que la información
                    proporcionada es correcta y autorizas su uso para
                    gestionar y responder tu registro, conforme a nuestra
                    política de privacidad.
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Enviando registro..." : "Enviar registro"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
