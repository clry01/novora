import CartButton from "@/components/layout/CartButton";

export default function Header() {
  return (
    <>
      {/* Barra superior */}
      <div className="bg-[#172A3A] px-4 py-2 text-center text-xs tracking-wide text-white">
        Envíos a todo Lima. Compra fácil y segura
      </div>

      {/* Encabezado */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">

          {/* Marca */}
          <a href="#" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#172A3A] text-xl font-black text-white transition-all duration-300 hover:rotate-3 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30">
              N
            </span>

            <span className="text-2xl font-black tracking-tight text-[#172A3A]">
              ÓVORA<span className="text-blue-600">.</span>
            </span>
          </a>

          {/* Menú */}
          <nav className="hidden items-center gap-8 text-sm font-bold text-gray-600 md:flex">
            {[
              { label: "Inicio", href: "#" },
              { label: "Categorías", href: "#categorias" },
              { label: "Productos", href: "#productos" },
              { label: "Nosotros", href: "#nosotros" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="group relative py-1 transition-colors duration-300 hover:text-blue-700"
              >
                {item.label}

                <span className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-blue-600 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-4">
            <a
              href="#productos"
              className="hidden text-sm font-semibold transition-colors duration-300 hover:text-blue-700 md:block"
            >
              Explorar tienda
            </a>

           <CartButton />

          </div>

        </div>
      </header>
    </>
  );
}
