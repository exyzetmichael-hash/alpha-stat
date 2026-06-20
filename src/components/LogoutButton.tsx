"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { SPRING } from "@/components/motion/transitions";

export function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <motion.button
      onClick={handleLogout}
      disabled={loggingOut}
      whileHover={loggingOut ? undefined : { scale: 1.06 }}
      whileTap={loggingOut ? undefined : { scale: 0.94 }}
      transition={SPRING}
      className="rounded-lg px-1.5 py-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800 disabled:opacity-50"
    >
      {loggingOut ? "Выходим..." : "Выйти"}
    </motion.button>
  );
}
