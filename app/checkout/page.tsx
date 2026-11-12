
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { createClient } from "@/lib/supabase/browser";

const SHIPPING_COST = 10;

const DISTRICTS: Record<string, string[]> = {
  Lima: [
    "Ancón",
    "Ate",
    "Barranco",
    "Breña",
    "Carabayllo",
    "Chaclacayo",
    "Chorrillos",
    "Cieneguilla",
    "Comas",
    "El Agustino",
    "Independencia",
    "Jesús María",
    "La Molina",
    "La Victoria",
    "Lima",
    "Lince",
    "Los Olivos",
    "Lurigancho",
    "Lurín",
    "Magdalena del Mar",
    "Miraflores",
    "Pachacámac",
    "Pucusana",
    "Pueblo Libre",
    "Puente Piedra",
    "Punta Hermosa",
    "Punta Negra",
    "Rímac",
    "San Bartolo",
    "San Borja",
    "San Isidro",
    "San Juan de Lurigancho",
    "San Juan de Miraflores",
    "San Luis",
    "San Martín de Porres",
    "San Miguel",
    "Santa Anita",
    "Santa María del Mar",
    "Santa Rosa",
    "Santiago de Surco",
    "Surquillo",
    "Villa El Salvador",
    "Villa María del Triunfo",
  ],
  Callao: [
    "Callao",
    "Bellavista",
    "Carmen de la Legua-Reynoso",
    "La Perla",
    "La Punta",
    "Mi Perú",
    "Ventanilla",
  ],
};

type Product = {
  slug: string;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
};

type PaymentMethod = "plin" | "interbank" | "bbva";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);
  const [trackingToken, setTrackingToken] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("plin");
  const [paymentDataCopied, setPaymentDataCopied] = useState(false);

  const [departamento, setDepartamento] = useState("");
  const [distrito, setDistrito] = useState("");

  const distritosDisponibles = departamento
    ? DISTRICTS[departamento] ?? []
    : [];

  useEffect(() => {
    async function loadProducts() {
      const slugs = [...new Set(items.map((item) => item.slug))];

      if (slugs.length === 0) {
        setProducts([]);
        setProductsLoaded(true);
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .select("slug, name, price, stock, is_active")
        .in("slug", slugs)
        .eq("is_active", true);

      if (error) {
        console.error("Error cargando productos:", error);
        setError("No se pudieron cargar los productos. Inténtalo nuevamente.");
      } else {
        setProducts(data ?? []);
      }

      setProductsLoaded(true);
    }

    setProductsLoaded(false);
    loadProducts();
  }, [items]);

  const cartProducts = items.flatMap((item) => {
    const product = products.find((p) => p.slug === item.slug);

    if (!product) return [];

    const price = Number(product.price);

    return [
      {
        name: product.name,
        slug: product.slug,
        quantity: item.quantity,
        stock: product.stock,
        subtotal: price * item.quantity,
      },
    ];
  });

  const subtotal = cartProducts.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  const total = subtotal + SHIPPING_COST;

  const hasUnavailableProducts =
    cartProducts.length !== items.length;

  const hasInsufficientStock = cartProducts.some(
    (item) => item.quantity > item.stock || item.stock <= 0
  );

  const canSubmit =
    productsLoaded &&
    items.length > 0 &&
    !hasUnavailableProducts &&
    !hasInsufficientStock;

  async function handleCopyTrackingLink() {
    if (!trackingToken) return;

    const trackingUrl =
      `${window.location.origin}/pedido/${trackingToken}`;

    try {
      await navigator.clipboard.writeText(trackingUrl);
      setLinkCopied(true);
    } catch (error) {
      console.error("No se pudo copiar el enlace:", error);
      setLinkCopied(false);
    }
  }

  async function handleCopyPaymentData() {
    const paymentData: Record<Exclude<PaymentMethod, "plin">, string> = {
      interbank:
        "Interbank\nCuenta: 2003055969588\nCCI: 00320001305596958832\nTitular: Ricardo Inga Tacza",
      bbva:
        "BBVA\nCuenta: 001108040206099721\nCCI: 01180400020609972126\nTitular: Ricardo Inga Tacza",
    };

    if (paymentMethod === "plin") return;

    try {
      await navigator.clipboard.writeText(paymentData[paymentMethod]);
      setPaymentDataCopied(true);
    } catch (error) {
      console.error("No se pudieron copiar los datos:", error);
      setPaymentDataCopied(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cartProducts.length !== items.length) {
      setError("Hay productos que ya no están disponibles. Revisa tu carrito.");
      return;
    }

    if (hasInsufficientStock) {
      setError("El stock de uno o más productos es insuficiente. Revisa tu carrito.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    const departamento = String(formData.get("departamento") ?? "");
    const provincia = String(formData.get("provincia") ?? "");


    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...Object.fromEntries(formData.entries()),
          items: items.map((item) => ({
            slug: item.slug,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo registrar el pedido.");
      }

      setOrderTotal(Number(result.total));
      setOrderId(result.orderId);
      setTrackingToken(result.trackingToken);
      clearCart();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al registrar el pedido."
      );
    } finally {
      setLoading(false);
    }
  }

  if (orderId) {
    const paymentMethodName = {
      plin: "Plin",
      interbank: "Transferencia Interbank",
      bbva: "Transferencia BBVA",
    }[paymentMethod];

    const whatsappMessage =
      `Hola, acabo de realizar el pago de mi pedido mediante ${paymentMethodName}.\n\n` +
      `Número de pedido: ${orderId}\n` +
      `Monto pagado: S/ ${orderTotal.toFixed(2)}\n\n` +
      `Adjunto mi comprobante de pago.`;

    const whatsappUrl =
      `https://wa.me/51993521888?text=${encodeURIComponent(whatsappMessage)}`;

    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="text-center">
          <div className="text-5xl text-green-600">✓</div>

          <h1 className="mt-5 text-3xl font-black text-gray-900">
            ¡Pedido registrado!
          </h1>

          <p className="mt-3 text-gray-500">
            Tu pedido se guardó correctamente. Ahora completa el pago
            para que podamos procesarlo.
          </p>

          <div className="mt-6 rounded-xl bg-gray-100 p-4">
            <p className="text-sm text-gray-500">
              Número de pedido
            </p>

            <p className="mt-1 break-all font-bold text-gray-900">
              {orderId}
            </p>
          </div>

          {trackingToken && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="font-bold text-gray-900">
                Guarda el enlace de tu pedido
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Podrás volver a consultar tu pedido y realizar el pago
                aunque cierres esta página.
              </p>

              <Link
                href={`/pedido/${trackingToken}`}
                className="mt-4 block rounded-full bg-blue-700 px-5 py-3 text-center font-bold text-white hover:bg-blue-800"
              >
                Consultar mi pedido
              </Link>

              <button
                type="button"
                onClick={handleCopyTrackingLink}
                className="mt-3 w-full rounded-full border border-blue-700 px-5 py-3 font-bold text-blue-700 hover:bg-blue-100"
              >
                {linkCopied
                  ? "Enlace copiado ✓"
                  : "Copiar enlace de seguimiento"}
              </button>
            </div>
          )}
        </div>

        <section className="mt-8 rounded-2xl border border-gray-200 p-6">
          <h2 className="text-center text-xl font-black text-gray-900">
            Selecciona tu medio de pago
          </h2>

          <p className="mt-2 text-center text-sm text-gray-500">
            Puedes pagar mediante Plin o transferencia bancaria.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => {
                setPaymentMethod("plin");
                setPaymentDataCopied(false);
              }}
              className={`rounded-xl border-2 p-4 text-center transition ${paymentMethod === "plin"
                ? "border-purple-600 bg-purple-50"
                : "border-gray-200 hover:border-purple-300"
                }`}
            >
              <span className="mx-auto flex h-10 w-16 items-center justify-center rounded-lg bg-purple-600 text-lg font-black text-white">
                plin
              </span>
              <span className="mt-2 block text-sm font-bold text-gray-900">
                Plin
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPaymentMethod("interbank");
                setPaymentDataCopied(false);
              }}
              className={`rounded-xl border-2 p-4 text-center transition ${paymentMethod === "interbank"
                ? "border-cyan-600 bg-cyan-50"
                : "border-gray-200 hover:border-cyan-300"
                }`}
            >
              <span className="mx-auto flex h-10 w-16 items-center justify-center rounded-lg bg-cyan-600 text-sm font-black text-white">
                IBK
              </span>
              <span className="mt-2 block text-sm font-bold text-gray-900">
                Interbank
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPaymentMethod("bbva");
                setPaymentDataCopied(false);
              }}
              className={`rounded-xl border-2 p-4 text-center transition ${paymentMethod === "bbva"
                ? "border-blue-700 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
                }`}
            >
              <span className="mx-auto flex h-10 w-16 items-center justify-center rounded-lg bg-blue-700 text-lg font-black text-white">
                BBVA
              </span>
              <span className="mt-2 block text-sm font-bold text-gray-900">
                BBVA
              </span>
            </button>
          </div>

          <div className="mt-6 rounded-xl bg-blue-50 p-5 text-center">
            <p className="text-sm font-semibold text-gray-600">
              Total a pagar (incluye envío)
            </p>

            <p className="mt-1 text-3xl font-black text-blue-700">
              S/ {orderTotal.toFixed(2)}
            </p>
          </div>

          {paymentMethod === "plin" && (
            <div className="mt-6">
              <h3 className="text-center text-lg font-bold text-gray-900">
                Paga con Plin
              </h3>

              <p className="mt-2 text-center text-sm text-gray-500">
                Escanea el código QR desde tu aplicación Plin.
              </p>

              <div className="mx-auto mt-5 w-full max-w-xs rounded-2xl border border-gray-100 bg-white p-4">

                {/* Logo y nombre de Plin */}
                <div className="relative mx-auto h-[100px] w-full max-w-[105px] overflow-hidden">
                  <Image
                    src="/images/logo-plin.png"
                    alt="Plin y titular"
                    fill
                    className="object-cover"
                    style={{ objectPosition: "center 22%" }}
                  />
                </div>

                {/* Nombre del titular */}
                <p className="relative top-12 text-center text-lg font-bold text-gray-900">
                  Ricardo Jacob Inga Tacza
                </p>

                <Image
                  src="/images/plin-qr-recortado.jpeg"
                  alt="Código QR de Plin para realizar el pago"
                  width={420}
                  height={420}
                  className="!h-[400px] !w-[400px] object-contain"
                />

              </div>

              <div className="mt-5 rounded-xl border border-gray-200 p-5 text-center">
                <p className="text-sm text-gray-500">
                  También puedes enviar tu pago al número
                </p>

                <p className="mt-2 text-2xl font-black text-gray-900">
                  993 521 888
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Titular: Ricardo Inga Tacza
                </p>
              </div>
            </div>
          )}

          {paymentMethod === "interbank" && (
            <div className="mt-6 rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-14 items-center justify-center rounded-lg bg-cyan-600 text-sm font-black text-white">
                  IBK
                </span>

                <div>
                  <h3 className="font-bold text-gray-900">
                    Transferencia Interbank
                  </h3>
                  <p className="text-xs text-gray-500">
                    Realiza una transferencia bancaria
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Número de cuenta</p>
                  <p className="mt-1 break-all font-bold text-gray-900">
                    2003055969588
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">CCI</p>
                  <p className="mt-1 break-all font-bold text-gray-900">
                    00320001305596958832
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Titular de la cuenta</p>
                  <p className="mt-1 font-bold text-gray-900">
                    Ricardo Inga Tacza
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyPaymentData}
                className="mt-6 w-full rounded-full border border-cyan-600 px-5 py-3 text-sm font-bold text-cyan-700 transition hover:bg-cyan-50"
              >
                {paymentDataCopied
                  ? "Datos copiados ✓"
                  : "Copiar datos bancarios"}
              </button>
            </div>
          )}

          {paymentMethod === "bbva" && (
            <div className="mt-6 rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-14 items-center justify-center rounded-lg bg-blue-700 text-sm font-black text-white">
                  BBVA
                </span>

                <div>
                  <h3 className="font-bold text-gray-900">
                    Transferencia BBVA
                  </h3>
                  <p className="text-xs text-gray-500">
                    Realiza una transferencia bancaria
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Número de cuenta</p>
                  <p className="mt-1 break-all font-bold text-gray-900">
                    001108040206099721
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">CCI</p>
                  <p className="mt-1 break-all font-bold text-gray-900">
                    01180400020609972126
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Titular de la cuenta</p>
                  <p className="mt-1 font-bold text-gray-900">
                    Ricardo Inga Tacza
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyPaymentData}
                className="mt-6 w-full rounded-full border border-blue-700 px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
              >
                {paymentDataCopied
                  ? "Datos copiados ✓"
                  : "Copiar datos bancarios"}
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-sm leading-6 text-gray-600">
            Después de realizar el pago, envíanos tu comprobante por WhatsApp
            indicando tu número de pedido.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 block w-full rounded-full bg-green-600 px-6 py-4 text-center text-sm font-bold text-white transition hover:bg-green-700"
          >
            Enviar comprobante por WhatsApp
          </a>

          <p className="mt-4 text-center text-xs text-gray-400">
            Tu pedido permanecerá pendiente hasta que verifiquemos el pago.
          </p>
        </section>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block rounded-full bg-blue-700 px-8 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            Volver a la tienda
          </Link>
        </div>
      </main>
    );
  }

  if (!productsLoaded) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-gray-500">Cargando tu compra...</p>
      </main>
    );
  }

  if (items.length === 0 || cartProducts.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-black">Tu carrito está vacío</h1>

        <p className="mt-3 text-gray-500">
          Agrega productos antes de continuar con tu compra.
        </p>

        <Link
          href="/cart"
          className="mt-8 inline-block rounded-full bg-blue-700 px-8 py-3 font-bold text-white"
        >
          Volver al carrito
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#1E40AF]"
        >
          <span aria-hidden="true">←</span>
          Volver al carrito
        </Link>

        <div className="mt-7 overflow-hidden rounded-3xl bg-[#1E40AF] px-6 py-8 text-white shadow-lg shadow-slate-900/10 sm:px-9 sm:py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">
                NÓVORA · Compra segura
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Finalizar compra
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Completa tus datos de contacto y entrega para registrar tu pedido.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start rounded-2xl border border-white/15 bg-white/10 px-4 py-3 sm:self-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-[#1E40AF]">
                1
              </span>
              <div>
                <p className="text-sm font-bold text-white">Tus datos</p>
                <p className="text-xs text-slate-300">Paso 1 de 2</p>
              </div>
              <span className="mx-1 h-7 w-px bg-white/20" />
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-sm font-bold text-slate-300">
                2
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-300">Pago</p>
                <p className="text-xs text-slate-400">Siguiente</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1E40AF]/[0.07] text-lg font-black text-[#1E40AF]">
                  01
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-[#1E40AF] sm:text-xl">
                    Datos personales
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    ¿Cómo podemos contactarte para coordinar tu pedido?
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="nombres" className="text-sm font-semibold text-slate-700">
                    Nombres <span className="text-blue-700">*</span>
                  </label>
                  <input
                    id="nombres"
                    name="nombres"
                    required
                    autoComplete="given-name"
                    placeholder="Ingresa tus nombres"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-[#1E40AF]/10"
                  />
                </div>

                <div>
                  <label htmlFor="apellidos" className="text-sm font-semibold text-slate-700">
                    Apellidos <span className="text-blue-700">*</span>
                  </label>
                  <input
                    id="apellidos"
                    name="apellidos"
                    required
                    autoComplete="family-name"
                    placeholder="Ingresa tus apellidos"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-[#1E40AF]/10"
                  />
                </div>

                <div>
                  <label htmlFor="celular" className="text-sm font-semibold text-slate-700">
                    Celular <span className="text-blue-700">*</span>
                  </label>
                  <input
                    id="celular"
                    name="celular"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="Ej. 987 654 321"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-[#1E40AF]/10"
                  />
                </div>

                <div>
                  <label htmlFor="correo" className="text-sm font-semibold text-slate-700">
                    Correo electrónico <span className="text-blue-700">*</span>
                  </label>
                  <input
                    id="correo"
                    name="correo"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="tucorreo@ejemplo.com"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-[#1E40AF]/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="dni" className="text-sm font-semibold text-slate-700">
                    DNI <span className="font-normal text-slate-400">(opcional)</span>
                  </label>
                  <input
                    id="dni"
                    name="dni"
                    maxLength={8}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Ingresa tu número de DNI"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-[#1E40AF]/10 sm:max-w-md"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1E40AF]/[0.07] text-lg font-black text-[#1E40AF]">
                  02
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-[#1E40AF] sm:text-xl">
                    Dirección de entrega
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Indícanos dónde deseas recibir tu pedido.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <span className="mt-0.5 text-[#1E40AF]" aria-hidden="true">ⓘ</span>
                <p className="text-sm leading-5 text-slate-600">
                  Por ahora realizamos entregas únicamente en Lima Metropolitana y Callao.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="departamento"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Departamento <span className="text-blue-700">*</span>
                  </label>

                  <select
                    id="departamento"
                    name="departamento"
                    required
                    autoComplete="address-level1"
                    value={departamento}
                    onChange={(event) => {
                      setDepartamento(event.target.value);
                      setDistrito("");
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-[#1E40AF]/10"
                  >
                    <option value="">Selecciona un departamento</option>
                    <option value="Lima">Lima</option>
                    <option value="Callao">Callao</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="provincia"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Provincia <span className="text-blue-700">*</span>
                  </label>

                  <input
                    id="provincia"
                    name="provincia"
                    required
                    autoComplete="address-level2"
                    value={
                      departamento === "Lima"
                        ? "Lima"
                        : departamento === "Callao"
                          ? "Callao"
                          : ""
                    }
                    readOnly
                    placeholder="Se completará automáticamente"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 outline-none"
                  />
                </div>



                <div>
                  <label
                    htmlFor="distrito"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Distrito <span className="text-blue-700">*</span>
                  </label>

                  <select
                    id="distrito"
                    name="distrito"
                    required
                    autoComplete="address-level3"
                    value={distrito}
                    onChange={(event) => setDistrito(event.target.value)}
                    disabled={!departamento}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-[#1E40AF]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {departamento
                        ? "Selecciona tu distrito"
                        : "Primero selecciona un departamento"}
                    </option>

                    {distritosDisponibles.map((nombreDistrito) => (
                      <option key={nombreDistrito} value={nombreDistrito}>
                        {nombreDistrito}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="direccion" className="text-sm font-semibold text-slate-700">
                    Dirección <span className="text-blue-700">*</span>
                  </label>
                  <input
                    id="direccion"
                    name="direccion"
                    required
                    autoComplete="street-address"
                    placeholder="Av., calle, jirón, número..."
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-[#1E40AF]/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="referencia" className="text-sm font-semibold text-slate-700">
                    Referencia <span className="font-normal text-slate-400">(opcional)</span>
                  </label>
                  <input
                    id="referencia"
                    name="referencia"
                    autoComplete="off"
                    placeholder="Ej. Cerca de un parque, mercado o edificio"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-[#1E40AF]/10"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-4">
                <div>
                  <p className="text-sm font-bold text-[#1E40AF]">Envío a domicilio</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Tarifa fija para Lima Metropolitana y Callao
                  </p>
                </div>
                <p className="shrink-0 text-base font-extrabold text-[#1E40AF]">
                  S/ {SHIPPING_COST.toFixed(2)}
                </p>
              </div>
            </section>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full rounded-xl bg-[#1E40AF] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#1E40AF]/15 transition hover:bg-[#213D55] focus:outline-none focus:ring-4 focus:ring-[#1E40AF]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Registrando pedido..." : "Registrar pedido y continuar al pago"}
            </button>

            <p className="text-center text-xs leading-5 text-slate-400">
              Tus datos se utilizarán únicamente para gestionar y coordinar la entrega de tu pedido.
            </p>
          </form>

          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-6">
            <div className="bg-[#1E40AF] px-6 py-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                Tu pedido
              </p>
              <h2 className="mt-1 text-xl font-extrabold">Resumen de compra</h2>
            </div>

            <div className="p-5 sm:p-6">
              <div className="space-y-5">
                {cartProducts.map((item) => (
                  <div key={item.slug} className="flex justify-between gap-4">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-bold text-slate-800">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Cantidad: {item.quantity}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Stock disponible: {item.stock}
                      </p>

                      {item.quantity > item.stock && (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          Stock insuficiente. Reduce la cantidad en tu carrito.
                        </p>
                      )}

                      {item.stock <= 0 && (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          Producto agotado.
                        </p>
                      )}
                    </div>

                    <p className="shrink-0 text-sm font-bold text-slate-800">
                      S/ {item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {hasUnavailableProducts && (
                <p className="mt-5 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
                  Uno o más productos ya no están disponibles. Revisa tu carrito.
                </p>
              )}

              <div className="mt-6 space-y-3 border-t border-slate-200 pt-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-700">S/ {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Envío</span>
                  <span className="font-semibold text-slate-700">S/ {SHIPPING_COST.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-black text-[#1E40AF]">
                  <span>Total</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E40AF]/10 text-[#1E40AF]" aria-hidden="true">
                  ✓
                </span>
                <p className="text-xs leading-5 text-slate-600">
                  Revisa tus datos antes de continuar. El pago se realizará en el siguiente paso.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
