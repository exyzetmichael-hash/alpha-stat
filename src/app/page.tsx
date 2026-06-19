"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">Вы вошли в «Сезоны»</h1>
      <p className="max-w-sm text-sm text-gray-500">
        Это первый этап: проект создан, вход по общему паролю работает.
        Дальше здесь появится список филиалов и сезонов.
      </p>
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
      >
        {loggingOut ? "Выходим..." : "Выйти"}
      </button>
    </div>
  );
}
