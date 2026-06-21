import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Роли участников за столиками
const STANDARD_STOLIK_ROLES = [
  "Лидер",
  "Помощник",
  "Помощник (сервис)",
  "Гость",
  "Сопровождающий",
];

// Роли команды вне столиков
const STANDARD_KOMANDA_ROLES = [
  "Ведущий",
  "Участник",
  "Медиа",
  "Кухня",
  "Дети",
  "Молитва",
  "Музыкальное сопровождение",
  "Отпуск",
];

const DEFAULT_FILIALS = ["Филиал 1", "Филиал 2"];

const STANDARD_RASHOD_CATEGORIES = ["Ужины", "Покупки", "Помощь в выезде", "Подарки на выпускной"];
const STANDARD_DOHOD_CATEGORIES = ["Церковь", "Домашние группы", "Команда", "Другие"];

async function main() {
  for (const name of STANDARD_STOLIK_ROLES) {
    await prisma.rol.upsert({
      where: { name },
      update: { isStandard: true, deletedAt: null, scope: "STOLIK" },
      create: { name, isStandard: true, scope: "STOLIK" },
    });
  }

  for (const name of STANDARD_KOMANDA_ROLES) {
    await prisma.rol.upsert({
      where: { name },
      update: { isStandard: true, deletedAt: null, scope: "KOMANDA" },
      create: { name, isStandard: true, scope: "KOMANDA" },
    });
  }

  for (const name of DEFAULT_FILIALS) {
    const existing = await prisma.filial.findFirst({ where: { name } });
    if (!existing) {
      await prisma.filial.create({ data: { name } });
    }
  }

  for (const name of STANDARD_RASHOD_CATEGORIES) {
    await prisma.budjetKategoriya.upsert({
      where: { tip_name: { tip: "RASHOD", name } },
      update: {},
      create: { tip: "RASHOD", name },
    });
  }

  for (const name of STANDARD_DOHOD_CATEGORIES) {
    await prisma.budjetKategoriya.upsert({
      where: { tip_name: { tip: "DOHOD", name } },
      update: {},
      create: { tip: "DOHOD", name },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
