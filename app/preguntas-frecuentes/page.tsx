
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const questions = [
  {
    question: "¿A qué lugares realizan envíos?",
    answer:
      "Actualmente realizamos envíos a Lima Metropolitana y Callao. Estamos trabajando para ampliar nuestra cobertura.",
  },
  {
    question: "¿Cuánto cuesta el envío?",
    answer:
      "El costo de envío es de S/10 para los pedidos dentro de nuestra zona de cobertura.",
  },
  {
    question: "¿Qué medios de pago aceptan?",
    answer:
      "Actualmente aceptamos pagos mediante Yape. Al registrar tu pedido, podrás visualizar las instrucciones y el código QR para realizar el pago.",
  },
  {
    question: "¿Cómo confirmo mi pago?",
    answer:
      "Después de realizar el pago, sigue las instrucciones indicadas al registrar tu pedido y envíanos el comprobante por WhatsApp para que podamos verificarlo.",
  },
  {
    question: "¿Cuánto demora la entrega?",
    answer:
      "El tiempo de entrega puede variar según el producto y la dirección de destino. Puedes consultarnos por WhatsApp para recibir información sobre tu pedido.",
  },
  {
    question: "¿Cómo puedo consultar el estado de mi pedido?",
    answer:
      "Al realizar tu compra recibirás un correo con un enlace de seguimiento. Desde allí podrás consultar las actualizaciones de tu pedido.",
  },
  {
    question: "¿Qué hago si tengo un problema con mi pedido?",
    answer:
      "Puedes comunicarte con nosotros por WhatsApp al +51 993 521 888. Indícanos tu número de pedido para poder ayudarte.",
  },
  {
    question: "¿Puedo cancelar o solicitar un cambio?",
    answer:
      "Las solicitudes de cancelación, cambios o devoluciones se revisan de acuerdo con nuestras políticas. Comunícate con nosotros para recibir orientación.",
  },
];

export default function PreguntasFrecuentesPage() {
  return (
    <>
      <Header />

      <main className="bg-white">
        <section className="bg-gray-950 px-6 py-20 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Centro de ayuda
            </p>

            <h1 className="text-4xl font-black md:text-5xl">
              Preguntas frecuentes
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-300">
              Encuentra respuestas a las dudas más comunes sobre compras,
              pagos, envíos y seguimiento de pedidos.
            </p>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="space-y-4">
              {questions.map((item, index) => (
                <details
                  key={index}
                  className="group rounded-xl border border-gray-200 p-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-gray-900">
                    {item.question}

                    <span className="text-xl text-blue-600 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>

                  <p className="mt-4 leading-7 text-gray-600">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>

            <div className="mt-12 rounded-2xl bg-gray-50 p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                ¿No encontraste tu respuesta?
              </h2>

              <p className="mt-3 text-gray-600">
                Estamos disponibles para ayudarte con tus consultas.
              </p>

              <a
                href="https://wa.me/51993521888"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-xl bg-green-600 px-7 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                Contactar por WhatsApp
              </a>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/#productos"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                ← Volver a la tienda
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
