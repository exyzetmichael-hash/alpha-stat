import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { MAX_MESSAGE_LEN, PEER_FRESH_MS } from "@/lib/ploshad/scene";
import type { EmoteCode, Facing, Message, Peer, SyncResponse } from "@/lib/ploshad/types";

// Состояние присутствия живёт в БД и меняется на каждом запросе — кэшировать нечего.
export const dynamic = "force-dynamic";

// Эндпоинт уже за общим паролем (см. proxy.ts) — лимит по IP тут не столько
// защита от чужих, сколько бэкстоп от одного зарвавшегося клиента/скрипта.
// Считать его на весь офисный IP (NAT) нельзя: при 100+ людях за одним роутером
// это моментально блокирует всех. Поэтому основной лимит — per-clientId
// (у каждого браузера свой бюджет независимо от общего IP), а IP — широкий backstop.
const SYNC_LIMIT_PER_CLIENT = 90; // с запасом на open-опрос (1.5с ⇒ 40/мин) + чат/эмоции
const SYNC_LIMIT_PER_IP = 8000; // защита от реального шторма с одного адреса
const SYNC_WINDOW_MS = 60 * 1000;

const STALE_PRESENCE_MS = 30 * 1000; // строку старше — считаем ушедшим и удаляем
const STALE_MESSAGE_MS = 20 * 60 * 1000; // реплики старше 20 мин не храним
const MAX_MESSAGES = 20;

// Оппортунистическая чистка нужна не на каждый запрос — достаточно раз в
// несколько секунд на инстанс, иначе на потоке опроса это два лишних
// full-таблу-скана delete на КАЖДЫЙ heartbeat каждого браузера.
const CLEANUP_INTERVAL_MS = 5000;
let lastCleanupAt = 0;

const FACINGS: Facing[] = ["left", "right"];
const EMOTES: EmoteCode[] = ["highfive", "jump"];

function clamp01(n: unknown): number {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return Math.min(1, Math.max(0, v));
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  // Широкий backstop на IP — ловит только настоящий шторм, не легитимный офис за NAT.
  if (!checkRateLimit(`ploshad-ip:${ip}`, SYNC_LIMIT_PER_IP, SYNC_WINDOW_MS)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const clientId = typeof body.clientId === "string" ? body.clientId.trim() : "";
  if (!clientId || clientId.length > 100) {
    return NextResponse.json({ error: "no clientId" }, { status: 400 });
  }

  // Основной лимит — на конкретный браузер, не на общий офисный IP.
  if (!checkRateLimit(`ploshad-client:${clientId}`, SYNC_LIMIT_PER_CLIENT, SYNC_WINDOW_MS)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  // Уход со страницы (sendBeacon на unload): удаляем своё присутствие и выходим.
  if (body.leaving === true) {
    await prisma.presence.deleteMany({ where: { id: clientId } });
    return NextResponse.json({ peers: [], messages: [], serverNow: Date.now() } satisfies SyncResponse);
  }

  const name = (typeof body.name === "string" ? body.name : "Гость").trim().slice(0, 40) || "Гость";
  const color = typeof body.color === "string" ? body.color.slice(0, 16) : "#E63946";
  const x = clamp01(body.x);
  const facing: Facing = FACINGS.includes(body.facing as Facing) ? (body.facing as Facing) : "right";
  const emote: EmoteCode | null = EMOTES.includes(body.emote as EmoteCode) ? (body.emote as EmoteCode) : null;
  const text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_MESSAGE_LEN) : "";

  const now = Date.now();

  await prisma.presence.upsert({
    where: { id: clientId },
    create: { id: clientId, name, color, x, facing, emote, emoteAt: emote ? new Date(now) : null },
    update: { name, color, x, facing, emote, emoteAt: emote ? new Date(now) : undefined },
  });

  if (text) {
    await prisma.ploshadMessage.create({ data: { clientId, name, color, text } });
  }

  // Оппортунистическая чистка — на serverless нет cron, поэтому подметаем сами,
  // но не на каждый heartbeat: раз в CLEANUP_INTERVAL_MS на инстанс достаточно,
  // протухшие строки не накапливаются быстрее, а лишний full-scan delete на
  // каждый из ~70 запросов/сек при 100+ людях не нужен.
  if (now - lastCleanupAt >= CLEANUP_INTERVAL_MS) {
    lastCleanupAt = now;
    await prisma.presence.deleteMany({ where: { updatedAt: { lt: new Date(now - STALE_PRESENCE_MS) } } });
    await prisma.ploshadMessage.deleteMany({ where: { createdAt: { lt: new Date(now - STALE_MESSAGE_MS) } } });
  }

  const [presenceRows, messageRows] = await Promise.all([
    prisma.presence.findMany({
      where: { updatedAt: { gt: new Date(now - PEER_FRESH_MS) }, id: { not: clientId } },
    }),
    prisma.ploshadMessage.findMany({ orderBy: { createdAt: "desc" }, take: MAX_MESSAGES }),
  ]);

  const peers: Peer[] = presenceRows.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    x: p.x,
    facing: p.facing as Facing,
    emote: (p.emote as EmoteCode | null) ?? null,
    emoteAt: p.emoteAt ? p.emoteAt.getTime() : null,
  }));

  const messages: Message[] = messageRows
    .map((m) => ({
      id: m.id,
      clientId: m.clientId,
      name: m.name,
      color: m.color,
      text: m.text,
      createdAt: m.createdAt.getTime(),
    }))
    .reverse(); // вернуть в хронологическом порядке (старые → новые)

  return NextResponse.json({ peers, messages, serverNow: now } satisfies SyncResponse);
}
