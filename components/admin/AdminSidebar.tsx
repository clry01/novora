"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Resumen", href: "/admin" },
    { label: "Pedidos", href: "/admin/orders" },
    { label: "Productos", href: "/admin/products" },
    { label: "Clientes", href: "/admin/customers" },
    { label: "Configuración", href: "/admin/settings" },
  ];

  return (
    <aside className="hidden w-64 flex-shrink-0 bg-gray-950 p-6 text-white md:block">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#172A3A] text-lg font-black text-white">
          N
        </span>

        <h1 className="text-2xl font-black tracking-wide">
          ÓVORA<span className="text-blue-500">.</span>
        </h1>
      </div>

      <p className="mt-2 text-xs text-gray-400">
        Panel administrativo
      </p>

      <nav className="mt-12 space-y-3">
        {menuItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          const disabled = [
            "/admin/customers",
            "/admin/settings",
          ].includes(item.href);

          if (disabled) {
            return (
              <div
                key={item.href}
                className="cursor-not-allowed rounded-xl px-4 py-3 text-gray-500"
              >
                {item.label}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`block rounded-xl px-4 py-3 font-semibold transition ${
                active
                  ? "bg-blue-700 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <div className="mt-4">
          <LogoutButton />
        </div>
      </nav>
    </aside>
  );
}