
import HeroProductCarousel from "@/components/home/HeroProductCarousel";

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#101D30]">

      {/* Fondo animado con ondas luminosas */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute inset-0 bg-[#101D30]" />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 700"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <defs>
            <linearGradient id="waveBlue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0" />
              <stop offset="45%" stopColor="#2563EB" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="waveSky" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Primera onda */}
          <g className="novora-wave-one">
            <path
              d="M-200 430 C150 100 350 650 700 350 S1200 100 1650 400"
              stroke="url(#waveBlue)"
              strokeWidth="100"
              strokeLinecap="round"
              opacity="0.65"
            />
            <path
              d="M-200 430 C150 100 350 650 700 350 S1200 100 1650 400"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>

          {/* Segunda onda */}
          <g className="novora-wave-two">
            <path
              d="M-200 550 C200 250 450 750 850 450 S1250 250 1650 520"
              stroke="url(#waveSky)"
              strokeWidth="65"
              strokeLinecap="round"
              opacity="0.6"
            />
          </g>

          {/* Tercera onda */}
          <g className="novora-wave-three">
            <path
              d="M-200 250 C200 500 450 50 800 280 S1250 500 1650 200"
              stroke="#2563EB"
              strokeWidth="45"
              strokeLinecap="round"
              opacity="0.3"
            />
          </g>
        </svg>

        {/* Capa de profundidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#101D30]/55 via-transparent to-[#101D30]/40" />

      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:py-32">

        <div className="max-w-xl">
          <span className="mb-6 inline-block rounded-full border border-blue-300/25 bg-blue-400/10 px-4 py-2 text-xs font-semibold tracking-widest text-blue-300">
            DESCUBRE · ELIGE · DISFRUTA
          </span>

          <h1 className="text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
            Encuentra eso que
            <span className="block bg-gradient-to-r from-blue-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
              estabas buscando.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-gray-300">
            Productos seleccionados para hacer tu día más práctico,
            cómodo y especial. Descubre algo nuevo en cada visita.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#productos"
              className="rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition duration-300 hover:bg-blue-500"
            >
              Explorar productos →
            </a>

            <a
              href="#categorias"
              className="rounded-full border border-white/30 px-8 py-4 text-sm font-semibold text-white transition duration-300 hover:border-blue-300/60 hover:bg-white/10"
            >
              Ver categorías
            </a>
          </div>
        </div>

        {/* Carrusel */}
        <div className="relative md:-mr-16 lg:-mr-28">
          <HeroProductCarousel />
        </div>

      </div>
    </section>
  );
}
