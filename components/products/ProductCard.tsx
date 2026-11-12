
import Link from "next/link";

type ProductCardProps = {
  slug: string;
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  image: string;
  tag: string;
  stock: number;
};

export default function ProductCard({
  slug,
  name,
  category,
  price,
  oldPrice,
  image,
  tag,
  stock,
}: ProductCardProps) {
  const available = stock > 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:-translate-y-1 hover:shadow-xl">
      <div
        className="relative h-64 bg-gray-100 bg-cover bg-center"
        style={{ backgroundImage: `url('${image}')` }}
      >
        {tag && (
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[10px] font-black tracking-wider">
            {tag}
          </span>
        )}

        {!available && (
          <span className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-black tracking-wider text-white">
            AGOTADO
          </span>
        )}
      </div>

      <div className="p-5">
        <p className="text-xs text-gray-400">{category}</p>

        <h3 className="mt-2 font-bold">{name}</h3>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-lg font-black text-blue-700">
            {price}
          </span>

          {oldPrice && (
            <span className="text-sm text-gray-400 line-through">
              {oldPrice}
            </span>
          )}
        </div>

        <p
          className={`mt-3 text-xs font-semibold ${
            available ? "text-green-600" : "text-red-600"
          }`}
        >
          {stock === 1
            ? "Última unidad disponible"
            : available
              ? `Disponible: ${stock} unidades`
              : "Producto agotado"}
        </p>

        <Link
          href={`/products/${slug}`}
          className="mt-5 block rounded-full border border-gray-200 py-3 text-center text-sm font-bold transition hover:border-gray-950 hover:bg-gray-950 hover:text-white"
        >
          Ver producto
        </Link>
      </div>
    </article>
  );
}
