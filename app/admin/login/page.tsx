
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="text-center">

          {/* Marca NÓVORA */}
          <div className="flex items-center justify-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#172A3A] text-xl font-black text-white">
              N
            </span>
            <span className="text-3xl font-black tracking-tight text-[#172A3A]">
              ÓVORA<span className="text-blue-600">.</span>
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Administración de la tienda
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-10 space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Correo electrónico
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#172A3A]"
              placeholder="admin@correo.com"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Contraseña
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#172A3A]"
              placeholder="Tu contraseña"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#172A3A] px-6 py-3 font-bold text-white transition hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">
          Acceso exclusivo para administradores.
        </p>
      </div>
    </main>
  );
}
