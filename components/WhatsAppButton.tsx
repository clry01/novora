
export default function WhatsAppButton() {
  const message = encodeURIComponent(
    "Hola, tengo una consulta sobre NÓVORA."
  );

  return (
    <a
      href={`https://wa.me/51993521888?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar con NÓVORA por WhatsApp"
      className="fixed bottom-18 right-5 z-[100] flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[#1ebe5d]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="25"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
      </svg>

      <span className="flex flex-col">
        <span className="text-sm font-semibold">
          ¿Dudas? Escríbenos
        </span>
        <span className="text-[11px] opacity-90">
          Atención: 9 a. m. – 6 p. m.
        </span>
      </span>
    </a>
  );
}
