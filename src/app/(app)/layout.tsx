import { LogoutButton } from "@/components/LogoutButton";
import { ReportErrorButton } from "@/components/ReportErrorButton";
import { WhatsNewButton } from "@/components/WhatsNewButton";
import { Ploshad } from "@/components/ploshad/Ploshad";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PageTransition } from "@/components/motion/PageTransition";
import { NavLink } from "@/components/motion/NavLink";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <NavLink href="/filials" className="text-lg font-bold text-[#241A13]">
              Сезоны
            </NavLink>
            <nav className="flex items-center gap-2">
              <NavLink
                href="/search"
                className="rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
              >
                Поиск
              </NavLink>
              <NavLink
                href="/dashboard"
                className="rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
              >
                Дашборд
              </NavLink>
              <NavLink
                href="/trash"
                className="rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
              >
                Корзина
              </NavLink>
              <LogoutButton />
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
          <PageTransition>{children}</PageTransition>
        </main>
        <footer className="mx-auto w-full max-w-3xl px-4 py-6 text-center">
          <ReportErrorButton />
        </footer>
        <WhatsNewButton />
        <Ploshad />
      </div>
    </MotionProvider>
  );
}
