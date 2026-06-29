// Общие типы «площади» — используются и на клиенте, и в эндпоинте /api/ploshad/sync.

export type Facing = "left" | "right";
export type EmoteCode = "highfive" | "jump";

// Один человечек на сцене (присутствие другого браузера).
export type Peer = {
  id: string;
  name: string;
  color: string;
  x: number; // 0..1 вдоль сцены
  facing: Facing;
  emote: EmoteCode | null;
  emoteAt: number | null; // ms epoch, чтобы клиент решил, проигрывать ли эмоцию
};

// Короткая реплика в чате площади.
export type Message = {
  id: string;
  clientId: string;
  name: string;
  color: string;
  text: string;
  createdAt: number; // ms epoch
};

// Тело запроса синхронизации (отправляет браузер на каждом тике / при событии).
export type SyncRequest = {
  clientId: string;
  name: string;
  color: string;
  x: number;
  facing: Facing;
  emote?: EmoteCode | null;
  text?: string | null;
  leaving?: boolean;
};

// Ответ сервера: кто сейчас на площади и последние реплики.
export type SyncResponse = {
  peers: Peer[];
  messages: Message[];
  serverNow: number;
};
