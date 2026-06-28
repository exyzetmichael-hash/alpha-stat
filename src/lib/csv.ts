function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCsv(rows: string[][]): string {
  // BOM в начале — чтобы Excel сразу определил UTF-8 и не показал кракозябры.
  return "﻿" + rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
}
