# Film!

Онлайн-сервис бронирования билетов в кинотеатр.

Фронтенд — React, бэкенд — NestJS, база данных — PostgreSQL.

## Подготовка PostgreSQL

1. Установите и запустите PostgreSQL.
2. Создайте пользователя `filmuser` с правом входа.
3. Создайте базу данных `films` с владельцем `filmuser`.
4. Подключитесь к базе `films` и выполните SQL-файлы по порядку:

- `backend/test/prac.init.sql`
- `backend/test/prac.films.sql`
- `backend/test/prac.shedules.sql`

## Запуск бэкенда

```bash
cd backend
npm ci
```

Создайте `.env` на основе `.env.example`:

```env
DATABASE_DRIVER=postgres
DATABASE_URL=postgres://localhost:5432/films
DATABASE_USERNAME=filmuser
DATABASE_PASSWORD=your_password
PORT=3000
```

Укажите пароль пользователя PostgreSQL.

Запуск:

```bash
npm run start:dev
```

## Запуск фронтенда

```bash
cd frontend
npm ci
npm run dev
```

## Проверки бэкенда

```bash
npm run lint
npm run build
npm run test:e2e
```

## API

- `GET /api/afisha/films` — список фильмов.
- `GET /api/afisha/films/:id/schedule` — сеансы фильма.
- `POST /api/afisha/order` — бронирование билетов.
- `GET /content/afisha/*` — статические файлы.
