
const benefits = [
  ["✓", "Compra segura", "Proceso de compra protegido"],
  ["↗", "Envíos nacionales", "Cobertura según producto"],
  ["♡", "Productos elegidos", "Selección para ti"],
  ["☏", "Atención al cliente", "Estamos para ayudarte"],
];

export default function BenefitsSection() {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 md:grid-cols-4">
        {benefits.map(([icon, title, description]) => (
          <div key={title} className="flex items-center gap-3">
            <span className="text-2xl font-bold text-blue-600">
              {icon}
            </span>
            <div>
              <p className="text-sm font-bold">{title}</p>
              <p className="mt-1 text-xs text-gray-500">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
