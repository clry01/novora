
export default function Footer() {
  return (
    <footer className="bg-gray-950 px-6 py-12 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 md:grid-cols-4">

        {/* Marca */}
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-xl font-black text-white">
              N
            </span>
            <span className="text-2xl font-black tracking-tight">
              ÓVORA<span className="text-blue-400">.</span>
            </span>
          </div>

          <p className="mt-3 max-w-xs text-sm leading-6 text-gray-400">
            Una nueva forma de descubrir y comprar productos online.
          </p>
        </div>

        {/* Información */}
        <div>
          <h3 className="font-bold">Información</h3>

          <div className="mt-4 flex flex-col gap-3 text-sm text-gray-400">
            <a href="/nosotros" className="hover:text-white">
              Nosotros
            </a>
            <a href="/contacto" className="hover:text-white">
              Contacto
            </a>
            <a href="/#productos" className="hover:text-white">
              Productos
            </a>
          </div>
        </div>

        {/* Ayuda */}
        <div>
          <h3 className="font-bold">Ayuda</h3>

          <div className="mt-4 flex flex-col gap-3 text-sm text-gray-400">
            <a href="/preguntas-frecuentes" className="hover:text-white">
              Preguntas frecuentes
            </a>
            <a href="/libro-de-reclamaciones" className="hover:text-white">
              Libro de Reclamaciones
            </a>
          </div>
        </div>

        {/* Políticas */}
        <div>
          <h3 className="font-bold">Políticas</h3>

          <div className="mt-4 flex flex-col gap-3 text-sm text-gray-400">
            <a href="/terminos-y-condiciones" className="hover:text-white">
              Términos y condiciones
            </a>
            <a href="/politica-de-privacidad" className="hover:text-white">
              Política de privacidad
            </a>
            <a href="/cambios-y-devoluciones" className="hover:text-white">
              Cambios y devoluciones
            </a>
          </div>
        </div>

      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-gray-500">
        © 2026 NÓVORA. Todos los derechos reservados.
      </div>
    </footer>
  );
}
