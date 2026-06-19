# Chronos API

API Express + Prisma + MySQL para o Chronos Pomodoro.

## Como rodar

1. Copie `.env.example` para `.env`.
2. Ajuste `DATABASE_URL` com usuario, senha e banco MySQL.
3. Instale dependencias:

```bash
npm install
```

4. Crie as tabelas:

```bash
npm run prisma:migrate -- --name init
```

5. Suba a API:

```bash
npm run dev
```

## Endpoints

- `GET /health`
- `GET /settings`
- `PUT /settings`
- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/:id/complete`
- `PATCH /tasks/:id/interrupt`
- `DELETE /tasks`

Use `http://localhost:3333` como `baseUrl` no Postman.

## Postman

Importe `postman_collection.json` e crie um environment chamado `Chronos Local` com:

- `baseUrl`: `http://localhost:3333`
- `taskId`: deixe vazio, a request "Criar Task" preenche automaticamente.
