export type Product = {
  slug: string;
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  image: string;
  tag: string;
  description: string;
  features: string[];
};

export const products: Product[] = [
  {
    slug: "lampara-led-decorativa",
    name: "Lámpara LED decorativa",
    category: "Hogar",
    price: "S/ 59.90",
    oldPrice: "S/ 89.90",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700",
    tag: "MÁS VENDIDO",
    description:
      "Dale un toque moderno y acogedor a tus espacios con esta lámpara LED decorativa.",
    features: [
      "Diseño moderno y elegante",
      "Ideal para dormitorios y salas",
      "Iluminación decorativa",
    ],
  },
  {
    slug: "audifonos-inalambricos",
    name: "Audífonos inalámbricos",
    category: "Tecnología",
    price: "S/ 79.90",
    oldPrice: "S/ 119.90",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700",
    tag: "OFERTA",
    description:
      "Disfruta de tu música y contenido favorito con estos audífonos inalámbricos.",
    features: [
      "Diseño inalámbrico",
      "Fáciles de transportar",
      "Ideales para el uso diario",
    ],
  },
  {
    slug: "reloj-inteligente",
    name: "Reloj inteligente",
    category: "Accesorios",
    price: "S/ 99.90",
    oldPrice: "S/ 149.90",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700",
    tag: "NOVEDAD",
    description:
      "Complementa tu estilo diario con este reloj inteligente de diseño moderno.",
    features: [
      "Diseño moderno",
      "Cómodo para uso diario",
      "Estilo deportivo y casual",
    ],
  },
  {
    slug: "mochila-urbana",
    name: "Mochila urbana",
    category: "Accesorios",
    price: "S/ 89.90",
    oldPrice: "S/ 129.90",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700",
    tag: "DESTACADO",
    description:
      "Una mochila práctica para acompañarte en tus actividades y desplazamientos diarios.",
    features: [
      "Diseño urbano",
      "Práctica para el día a día",
      "Fácil de combinar",
    ],
  },
];