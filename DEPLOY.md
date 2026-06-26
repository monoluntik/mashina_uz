# Деплой Mashina.uz на Vercel + Neon

Полный гайд за ~15 минут. Бесплатно.

---

## Шаг 1 — PostgreSQL в Neon (бесплатно)

1. Открой [neon.tech](https://neon.tech) → **Start for free**
2. Создай проект: регион **AWS / Europe (Frankfurt)** (ближе к Узбекистану), имя — `mashina-uz`
3. В дашборде перейди в **Connection Details**
4. Выбери **Connection string** → скопируй строку вида:
   ```
   postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Сохрани — это твой `DATABASE_URL`

---

## Шаг 2 — Cloudinary для изображений (бесплатно)

1. Открой [cloudinary.com](https://cloudinary.com) → **Sign Up Free**
2. В дашборде найди: **Cloud name**, **API Key**, **API Secret**
3. Сохрани три значения

---

## Шаг 3 — Залить код на GitHub

```bash
# В корне проекта
git init   # если ещё нет репо
git add .
git commit -m "Initial commit"

# Создай репо на github.com → New repository → mashina-uz
git remote add origin https://github.com/ТВО_ИМЯ/mashina-uz.git
git push -u origin main
```

---

## Шаг 4 — Настроить базу данных

Установи локально переменную и загрузи схему:

```bash
# Сначала обнови DATABASE_URL в .env (вставь строку из Neon)
# Затем:

npx prisma db push          # создаёт таблицы в Neon
DATABASE_URL="postgresql://..." npm run db:seed    # заполняет 800 объявлений
```

> Seed занимает ~30-60 секунд.

---

## Шаг 5 — Деплой на Vercel

1. Открой [vercel.com](https://vercel.com) → **Add New Project**
2. Импортируй репо `mashina-uz` с GitHub
3. **Framework Preset**: Next.js (определится автоматически)
4. **Build Command**: оставь как есть (`prisma generate && next build` уже прописан в `package.json`)
5. Раздел **Environment Variables** — добавь:

| Имя переменной | Значение |
|---|---|
| `DATABASE_URL` | строка из Neon |
| `JWT_SECRET` | `openssl rand -base64 32` (любой длинный случайный текст) |
| `NEXT_PUBLIC_BASE_URL` | `https://твой-домен.vercel.app` (узнаешь после деплоя — можно обновить) |
| `CLOUDINARY_CLOUD_NAME` | из дашборда Cloudinary |
| `CLOUDINARY_API_KEY` | из дашборда Cloudinary |
| `CLOUDINARY_API_SECRET` | из дашборда Cloudinary |

6. Нажми **Deploy**

---

## После деплоя

### Обнови NEXT_PUBLIC_BASE_URL
В Vercel → Settings → Environment Variables → обнови `NEXT_PUBLIC_BASE_URL` на реальный URL (вида `https://mashina-uz-xxx.vercel.app`), затем сделай **Redeploy**.

### Первый вход в админку
- Откройте `https://твой-сайт.vercel.app/admin`
- Email: `admin@mashina.uz` | Пароль: `admin123`

---

## Структура env-переменных

```env
DATABASE_URL=                  # Neon PostgreSQL
JWT_SECRET=                    # любая длинная строка
NEXT_PUBLIC_BASE_URL=          # URL сайта
CLOUDINARY_CLOUD_NAME=         # Cloudinary
CLOUDINARY_API_KEY=            # Cloudinary
CLOUDINARY_API_SECRET=         # Cloudinary
```

Шаблон: `.env.example`

---

## Решение проблем

**`Error: P1001 Can't reach database`**
→ Проверь `DATABASE_URL` в Vercel. Строка должна быть с `?sslmode=require`

**Изображения не загружаются**
→ Проверь все три Cloudinary переменные. Или временно оставь пустыми — загрузки будут падать, но сайт будет работать.

**Билд падает с Prisma ошибкой**
→ Убедись что Build Command в Vercel — `prisma generate && next build` (уже настроено в `package.json`)

**Страница 404 на /ru или /uz**
→ `NEXT_PUBLIC_BASE_URL` не обновлён или редеплой не сделан
