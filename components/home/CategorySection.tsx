
const categories = [
  { name: "Tecnología", icon: "⌘" },
  { name: "Hogar", icon: "⌂" },
  { name: "Belleza", icon: "✧" },
  { name: "Accesorios", icon: "◈" },
];

export default function CategorySection() {
  return (
    <section id="categorias" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 text-center">
        <p className="text-xs font-bold tracking-[0.25em] text-blue-600">
          EXPLORA NUESTRA TIENDA
        </p>
        <h2 className="mt-3 text-3xl font-black md:text-4xl">
          Encuentra tu categoría
        </h2>
        <p className="mt-3 text-sm text-gray-500">
          Descubre productos para diferentes momentos de tu vida.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((category) => (
          <a
            key={category.name}
            href="#productos"
            className="group rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50"
          >
            <span className="text-4xl text-blue-600">{category.icon}</span>
            <h3 className="mt-4 font-bold">{category.name}</h3>
            <p className="mt-2 text-xs text-gray-500">
              Descubrir productos →
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
