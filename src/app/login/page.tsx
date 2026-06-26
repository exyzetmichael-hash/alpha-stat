"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT, SPRING } from "@/components/motion/transitions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setStatus("error");
        setErrorMessage(data.error ?? "Не удалось войти, попробуйте снова");
        return;
      }

      const next = searchParams.get("next") || "/";
      router.replace(next);
      router.refresh();
    } catch {
      setStatus("error");
      setErrorMessage("Нет связи с сервером. Проверьте интернет и попробуйте снова");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
      >
        <h1 className="mb-1 text-center text-2xl font-bold text-[#241A13]">
          Сезоны
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          Учёт сезонов программы
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              inputMode="text"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
              placeholder="Введите пароль"
            />
          </div>

          <AnimatePresence initial={false}>
            {status === "error" && (
              <motion.p
                key={errorMessage}
                role="alert"
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -4 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                className="overflow-hidden text-sm text-red-600"
              >
                {errorMessage}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={status === "loading" || password.length === 0}
            whileHover={status === "loading" || password.length === 0 ? undefined : { scale: 1.02 }}
            whileTap={status === "loading" || password.length === 0 ? undefined : { scale: 0.98 }}
            transition={SPRING}
            className="w-full rounded-xl bg-[#E63946] py-3 text-base font-semibold text-white disabled:opacity-50"
          >
            {status === "loading" ? "Входим..." : "Войти"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
