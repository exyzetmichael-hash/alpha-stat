"use client";

import { useState, type ReactNode } from "react";

export type SezonTab = { id: string; label: string; content: ReactNode };

// Верхняя навигация по разделам сезона: горизонтальная лента вкладок,
// прилипает под общей шапкой приложения. Содержимое разделов готовится на
// сервере и передаётся сюда — все серверные экшены и формы продолжают работать.
export function SezonTabs({ tabs }: { tabs: SezonTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div>
      <div className="sticky top-[53px] z-10 -mx-4 border-b border-gray-200 bg-[var(--background)]/95 px-2 backdrop-blur">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.id === active?.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveId(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={`relative whitespace-nowrap px-3 py-2.5 text-sm font-bold transition-colors ${
                  isActive ? "text-[#E63946]" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#E63946]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-5">{active?.content}</div>
    </div>
  );
}
