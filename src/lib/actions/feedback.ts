"use server";

import type { ActionState } from "./filial";

// Отправка сообщения об ошибке от пользователя администратору в Telegram.
// Нужны две переменные окружения (см. .env.example и DEPLOY.md):
//   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
//   TELEGRAM_CHAT_ID   — id чата администратора, куда слать сообщения
export async function sendErrorReport(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const message = String(formData.get("message") ?? "").trim();
  const pageUrl = String(formData.get("pageUrl") ?? "").trim();

  if (!message) {
    return { error: "Опишите, что случилось" };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      error: "Отправка обратной связи пока не настроена. Сообщите администратору напрямую.",
    };
  }

  const text = [
    "🐞 Сообщение об ошибке в сервисе «Сезоны»",
    "",
    message,
    pageUrl ? `\nСтраница: ${pageUrl}` : "",
  ].join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!response.ok) {
      return { error: "Не удалось отправить. Попробуйте ещё раз." };
    }
  } catch {
    return { error: "Не удалось отправить. Проверьте связь и попробуйте ещё раз." };
  }

  return null;
}
