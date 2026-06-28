export function ExportLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
    >
      ⬇ Экспорт CSV
    </a>
  );
}
