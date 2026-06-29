"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar } from "./Avatar";
import { NameSettings } from "./NameSettings";
import {
  getIdentity,
  getIdentitySnapshot,
  getServerIdentitySnapshot,
  subscribeIdentity,
  updateIdentity,
} from "@/lib/ploshad/identity";
import {
  BENCH_XS,
  BUBBLE_VISIBLE_MS,
  EMOTE_PLAY_MS,
  MAX_MESSAGE_LEN,
  POLL_INTERVAL_MS,
  PROPS,
  SIT_THRESHOLD,
  STEP,
} from "@/lib/ploshad/scene";
import { EASE_OUT } from "@/components/motion/transitions";
import type { EmoteCode, Facing, Message, Peer, SyncRequest, SyncResponse } from "@/lib/ploshad/types";

const WALK_LINGER_MS = 1300;

// «Площадь» — лёгкий слой присутствия поверх всего приложения (как TownSquare).
// Реальное время делаем опросом /api/ploshad/sync: на каждом тике шлём своё
// состояние и забираем остальных; плавность — анимацией на клиенте.
export function Ploshad() {
  // Личность (clientId/имя/цвет) — из внешнего стора поверх localStorage.
  const me = useSyncExternalStore(subscribeIdentity, getIdentitySnapshot, getServerIdentitySnapshot);
  const ready = me.clientId !== "";

  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [myX, setMyX] = useState(0.5);
  const [facing, setFacing] = useState<Facing>("right");
  const [peers, setPeers] = useState<Peer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [moved, setMoved] = useState<Record<string, number>>({});
  const [now, setNow] = useState(0);
  const [chat, setChat] = useState("");
  const [myEmote, setMyEmote] = useState<{ code: EmoteCode; at: number } | null>(null);
  const [walkingSelf, setWalkingSelf] = useState(false);

  const myXRef = useRef(myX);
  const facingRef = useRef(facing);
  const inFlightRef = useRef(false);
  const pendingEmoteRef = useRef<EmoteCode | null>(null);
  const pendingTextRef = useRef<string | null>(null);
  const prevPeerXRef = useRef<Map<string, number>>(new Map());
  const movedAtRef = useRef<Map<string, number>>(new Map());
  const walkTimerRef = useRef<number | null>(null);

  useEffect(() => {
    myXRef.current = myX;
  }, [myX]);
  useEffect(() => {
    facingRef.current = facing;
  }, [facing]);

  // Один heartbeat: пишем себя, забираем площадь. Гард «один запрос в полёте».
  const sync = useCallback(async () => {
    const self = getIdentity();
    if (!self.clientId || inFlightRef.current) return;
    inFlightRef.current = true;

    const body: SyncRequest = {
      clientId: self.clientId,
      name: self.name,
      color: self.color,
      x: myXRef.current,
      facing: facingRef.current,
      emote: pendingEmoteRef.current,
      text: pendingTextRef.current,
    };
    pendingEmoteRef.current = null;
    pendingTextRef.current = null;

    try {
      const res = await fetch("/api/ploshad/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data: SyncResponse = await res.json();
        const tick = Date.now();
        for (const p of data.peers) {
          const prev = prevPeerXRef.current.get(p.id);
          if (prev !== undefined && Math.abs(prev - p.x) > 0.002) movedAtRef.current.set(p.id, tick);
          prevPeerXRef.current.set(p.id, p.x);
        }
        setPeers(data.peers);
        setMessages(data.messages);
        setMoved(Object.fromEntries(movedAtRef.current));
        setNow(tick);
      }
    } catch {
      // сеть моргнула — следующий тик догонит
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  // Опрос: тик по таймеру (пауза на скрытой вкладке) + уход через sendBeacon.
  useEffect(() => {
    if (!ready) return;
    sync();
    const iv = window.setInterval(() => {
      if (!document.hidden) sync();
    }, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (!document.hidden) sync();
    };
    document.addEventListener("visibilitychange", onVisible);

    const leave = () => {
      const self = getIdentity();
      if (!self.clientId || !navigator.sendBeacon) return;
      const blob = new Blob([JSON.stringify({ clientId: self.clientId, leaving: true })], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/ploshad/sync", blob);
    };
    window.addEventListener("pagehide", leave);

    return () => {
      window.clearInterval(iv);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, [ready, sync]);

  const markWalking = useCallback(() => {
    setWalkingSelf(true);
    if (walkTimerRef.current) window.clearTimeout(walkTimerRef.current);
    walkTimerRef.current = window.setTimeout(() => setWalkingSelf(false), WALK_LINGER_MS);
  }, []);

  const moveTo = useCallback(
    (x: number) => {
      const clamped = Math.min(1, Math.max(0, x));
      setFacing(clamped >= myXRef.current ? "right" : "left");
      setMyX(clamped);
      markWalking();
    },
    [markWalking],
  );

  const doEmote = useCallback(
    (code: EmoteCode) => {
      setMyEmote({ code, at: Date.now() });
      pendingEmoteRef.current = code;
      sync();
    },
    [sync],
  );

  const sendChat = useCallback(() => {
    const text = chat.trim().slice(0, MAX_MESSAGE_LEN);
    if (!text) return;
    pendingTextRef.current = text;
    setChat("");
    sync();
  }, [chat, sync]);

  const handleSaveSettings = useCallback(
    (name: string, color: string) => {
      updateIdentity(name, color);
      setSettingsOpen(false);
      sync();
    },
    [sync],
  );

  // Управление с клавиатуры работает, только когда сцена в фокусе — чтобы не
  // перехватывать стрелки/буквы у форм приложения.
  const onStageKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        moveTo(myXRef.current + STEP);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveTo(myXRef.current - STEP);
      } else if (e.key.toLowerCase() === "h") {
        doEmote("highfive");
      } else if (e.key.toLowerCase() === "j") {
        doEmote("jump");
      }
    },
    [moveTo, doEmote],
  );

  const onStagePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      moveTo((e.clientX - rect.left) / rect.width);
    },
    [moveTo],
  );

  const onlineCount = peers.length + 1;

  const bubbleFor = (clientId: string): string | null => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.clientId === clientId) return now - m.createdAt < BUBBLE_VISIBLE_MS ? m.text : null;
    }
    return null;
  };
  const nearBench = (x: number) => BENCH_XS.some((b) => Math.abs(b - x) < SIT_THRESHOLD);
  const peerWalking = (id: string) => now - (moved[id] ?? 0) < WALK_LINGER_MS;
  const peerEmote = (p: Peer): EmoteCode | null =>
    p.emote && p.emoteAt && now - p.emoteAt < EMOTE_PLAY_MS ? p.emote : null;
  const selfEmote: EmoteCode | null = myEmote && now - myEmote.at < EMOTE_PLAY_MS ? myEmote.code : null;

  const recent = messages.slice(-4);

  return (
    <div className="fixed bottom-5 left-5 z-40">
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="pill"
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            aria-label="Открыть площадь"
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#241A13] shadow-md shadow-black/5 transition-colors hover:border-[#E63946]/40"
          >
            <span aria-hidden>👋</span>
            <span>Площадь</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E63946] px-1 text-xs font-bold text-white">
              {onlineCount}
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="w-[min(620px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
          >
            {/* Шапка */}
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#241A13]">Площадь</span>
                <span className="text-xs text-gray-500">{onlineCount} онлайн</span>
              </div>
              <div className="relative flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSettingsOpen((v) => !v)}
                  aria-label="Имя и цвет"
                  className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:text-gray-800"
                >
                  ⚙
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Свернуть площадь"
                  className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>
                <AnimatePresence>
                  {settingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: EASE_OUT }}
                      className="absolute right-0 top-9 z-10"
                    >
                      <NameSettings
                        name={me.name}
                        color={me.color}
                        onSave={handleSaveSettings}
                        onClose={() => setSettingsOpen(false)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Сцена */}
            <div
              tabIndex={0}
              onKeyDown={onStageKeyDown}
              onPointerDown={onStagePointerDown}
              role="application"
              aria-label="Сцена площади: кликните, стрелки — ходить, H — дай пять, J — прыжок"
              className="relative h-36 cursor-pointer select-none overflow-hidden bg-gradient-to-b from-[#eef3ee] to-[#e3dccf] outline-none focus:ring-2 focus:ring-inset focus:ring-[#E63946]/30"
            >
              {/* Земля */}
              <div className="absolute bottom-0 left-0 h-6 w-full bg-[#cdbfa3]" />

              {/* Реквизит (косметика) */}
              {PROPS.map((prop, i) => (
                <div
                  key={i}
                  className="pointer-events-none absolute bottom-4"
                  style={{ left: `${prop.x * 100}%`, transform: "translateX(-50%)" }}
                >
                  {prop.type === "tree" && (
                    <div className="flex flex-col items-center">
                      <div className="h-7 w-7 rounded-full bg-[#6f9266]" />
                      <div className="-mt-1 h-4 w-1.5 rounded-sm bg-[#7a5c43]" />
                    </div>
                  )}
                  {prop.type === "bench" && <div className="h-2 w-10 rounded-sm bg-[#9a7b59]" />}
                  {prop.type === "lamp" && (
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-[#f2d479]" />
                      <div className="-mt-0.5 h-8 w-1 bg-[#8c8079]" />
                    </div>
                  )}
                </div>
              ))}

              {/* Другие люди */}
              {peers.map((p) => {
                const walking = peerWalking(p.id);
                return (
                  <Avatar
                    key={p.id}
                    name={p.name}
                    color={p.color}
                    x={p.x}
                    facing={p.facing}
                    walking={walking}
                    sitting={!walking && nearBench(p.x)}
                    emote={peerEmote(p)}
                    emoteKey={p.emoteAt ?? 0}
                    bubble={bubbleFor(p.id)}
                    isYou={false}
                  />
                );
              })}

              {/* Ты */}
              {ready && (
                <Avatar
                  name={me.name}
                  color={me.color}
                  x={myX}
                  facing={facing}
                  walking={walkingSelf}
                  sitting={!walkingSelf && nearBench(myX)}
                  emote={selfEmote}
                  emoteKey={myEmote?.at ?? 0}
                  bubble={bubbleFor(me.clientId)}
                  isYou
                />
              )}
            </div>

            {/* Лента реплик */}
            <div className="h-16 space-y-0.5 overflow-y-auto bg-gray-50 px-3 py-2 text-xs">
              {recent.length === 0 ? (
                <p className="text-gray-400">Пока тихо. Поздоровайтесь 👋</p>
              ) : (
                recent.map((m) => (
                  <p key={m.id} className="truncate">
                    <span className="font-semibold" style={{ color: m.color }}>
                      {m.name}:
                    </span>{" "}
                    <span className="text-gray-700">{m.text}</span>
                  </p>
                ))
              )}
            </div>

            {/* Ввод + эмоции */}
            <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-2">
              <input
                type="text"
                value={chat}
                maxLength={MAX_MESSAGE_LEN}
                onChange={(e) => setChat(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendChat();
                  }
                }}
                placeholder="Сказать что-нибудь…"
                className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-1.5 text-sm focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
              />
              <button
                type="button"
                onClick={() => doEmote("highfive")}
                aria-label="Дай пять"
                className="rounded-lg px-2 py-1.5 text-base hover:bg-gray-100"
              >
                🙌
              </button>
              <button
                type="button"
                onClick={() => doEmote("jump")}
                aria-label="Прыжок"
                className="rounded-lg px-2 py-1.5 text-base hover:bg-gray-100"
              >
                ⤴
              </button>
              <button
                type="button"
                onClick={sendChat}
                className="rounded-lg bg-[#E63946] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#d52f3c]"
              >
                →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
