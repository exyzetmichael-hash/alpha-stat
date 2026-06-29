// Личность на «площади» живёт в localStorage браузера — аккаунтов в приложении нет,
// поэтому каждый браузер сам себе clientId + выбранные имя и цвет (как accountless
// в TownSquare). Имена самоназначаемые и не аутентифицируются.

const CLIENT_ID_KEY = "ploshad:clientId";
const NAME_KEY = "ploshad:name";
const COLOR_KEY = "ploshad:color";
const NAME_SET_KEY = "ploshad:nameChosen"; // отличаем дефолт от выбранного пользователем

// Тёплая палитра аватаров — в тон дизайн-системе (бежевый фон, акцент #E63946).
export const AVATAR_COLORS = [
  "#E63946", // красный (основной акцент)
  "#E76F51", // терракота
  "#E9A23B", // охра
  "#5C8A5A", // зелёный
  "#3D7A8C", // сине-зелёный
  "#7A5C9E", // лиловый
  "#C25E8B", // розово-малиновый
  "#6B6059", // тёплый серо-коричневый
];

export type Identity = {
  clientId: string;
  name: string;
  color: string;
  nameChosen: boolean;
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomGuestName(): string {
  // Двузначный суффикс, чтобы дефолтные имена не совпадали слишком часто.
  return `Гость-${Math.floor(10 + Math.random() * 90)}`;
}

// Возвращает личность из localStorage, создавая дефолты при первом заходе.
// Безопасно вызывать только в браузере (внутри useEffect).
export function loadIdentity(): Identity {
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }

  let name = localStorage.getItem(NAME_KEY);
  if (!name) {
    name = randomGuestName();
    localStorage.setItem(NAME_KEY, name);
  }

  let color = localStorage.getItem(COLOR_KEY);
  if (!color || !AVATAR_COLORS.includes(color)) {
    color = pick(AVATAR_COLORS);
    localStorage.setItem(COLOR_KEY, color);
  }

  const nameChosen = localStorage.getItem(NAME_SET_KEY) === "1";

  return { clientId, name, color, nameChosen };
}

export function saveName(name: string): void {
  localStorage.setItem(NAME_KEY, name);
  localStorage.setItem(NAME_SET_KEY, "1");
}

export function saveColor(color: string): void {
  localStorage.setItem(COLOR_KEY, color);
}

// --- Стор личности для useSyncExternalStore ---
// Читаем localStorage через внешний стор (как WhatsNewButton), чтобы не дёргать
// setState в эффекте и не ловить рассинхрон при гидрации.

const SERVER_IDENTITY: Identity = { clientId: "", name: "", color: "#E63946", nameChosen: false };
let cached: Identity | null = null;
const listeners = new Set<() => void>();

export function getIdentitySnapshot(): Identity {
  if (typeof window === "undefined") return SERVER_IDENTITY;
  if (!cached) cached = loadIdentity();
  return cached;
}

export function getServerIdentitySnapshot(): Identity {
  return SERVER_IDENTITY;
}

export function subscribeIdentity(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Текущая личность для синхронного чтения в обработчиках/опросе (без подписки).
export function getIdentity(): Identity {
  return getIdentitySnapshot();
}

export function updateIdentity(name: string, color: string): void {
  saveName(name);
  saveColor(color);
  cached = { ...(cached ?? loadIdentity()), name, color, nameChosen: true };
  listeners.forEach((l) => l());
}
