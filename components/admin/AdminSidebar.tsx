
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label: "Resumen", href: "/admin" },
    { label: "Pedidos", href: "/admin/orders" },
    { label: "Productos", href: "/admin/products" },
    { label: "Clientes", href: "/admin/customers" },
    { label: "Configuración", href: "/admin/settings" },
  ];

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`);

  const isDisabled = (href: string) =>
    ["/admin/customers", "/admin/settings"].includes(href);

  return (
    <>
      {/* MENÚ MÓVIL */}
      <div className="flex w-full items-center justify-between bg-gray-950 px-5 py-4 text-white md:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#172A3A] text-lg font-black">
            N
          </span>

          <h1 className="text-xl font-black tracking-wide">
            ÓVORA<span className="text-blue-500">.</span>
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="rounded-lg p-2 text-2xl text-white hover:bg-gray-800"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          ☰
        </button>
      </div>

      {/* PANEL DESPLEGABLE MÓVIL */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/60"
            aria-label="Cerrar menú"
          />

          <aside className="relative flex h-full w-72 max-w-[85%] flex-col bg-gray-950 p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#172A3A] text-lg font-black">
                  N
                </span>

                <h1 className="text-xl font-black tracking-wide">
                  ÓVORA<span className="text-blue-500">.</span>
                </h1>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-1 text-2xl text-gray-300 hover:bg-gray-800"
                aria-label="Cerrar menú"
              >
                ×
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Panel administrativo
            </p>

            <nav className="mt-10 flex-1 space-y-3">
              {menuItems.map((item) => {
                const active = isActive(item.href);
                const disabled = isDisabled(item.href);

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
                    onClick={() => setMenuOpen(false)}
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
            </nav>

            <div className="mt-4">
              <LogoutButton />
            </div>
          </aside>
        </div>
      )}

      {/* PANEL LATERAL ESCRITORIO */}
      <aside className="hidden min-h-screen w-64 flex-shrink-0 flex-col bg-gray-950 p-6 text-white md:flex">
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

        <nav className="mt-12 flex-1 space-y-3">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const disabled = isDisabled(item.href);

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
        </nav>

        <div className="mt-4">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
