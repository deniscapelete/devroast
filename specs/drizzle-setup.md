# Spec: Drizzle ORM + PostgreSQL

> Especificação para integração do banco de dados relacional ao DevRoast.

---

## Contexto

O app precisa persistir submissões de código e seus resultados de roast para:

1. Exibir o **Leaderboard da Vergonha** (`/leaderboard`) com os piores códigos rankeados
2. Permitir que cada roast tenha uma **URL pública** compartilhável (`/roast/[id]`)
3. Mostrar **estatísticas globais** na homepage (total de roasts, média de score)

---

## Adições ao stack

| Pacote | Uso |
|---|---|
| `drizzle-orm` | ORM + query builder |
| `drizzle-kit` | CLI para migrations e geração de schema |
| `postgres` | Driver PostgreSQL (sem `pg` — `postgres` é mais moderno e tree-shakeable) |
| `@t3-oss/env-nextjs` | Validação de env vars com Zod (recomendado) |

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

---

## Docker Compose

Criar `docker-compose.yml` na raiz do projeto:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: devroast-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
      POSTGRES_DB: devroast
    ports:
      - "5432:5432"
    volumes:
      - devroast_pgdata:/var/lib/postgresql/data

volumes:
  devroast_pgdata:
```

Subir com:

```bash
docker compose up -d
```

---

## Variáveis de ambiente

Criar `.env.local` (já deve estar no `.gitignore`):

```env
DATABASE_URL="postgres://devroast:devroast@localhost:5432/devroast"
```

---

## Schema

### `src/db/schema.ts` — arquivo completo

```ts
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const languageEnum = pgEnum("language", [
  "javascript",
  "typescript",
  "python",
  "sql",
  "go",
  "rust",
  "java",
  "php",
  "ruby",
  "other",
]);

export const verdictEnum = pgEnum("verdict", [
  "catastrophic",       // 0.0 – 1.9
  "needs_serious_help", // 2.0 – 3.9
  "questionable",       // 4.0 – 5.9
  "mediocre",           // 6.0 – 7.9
  "acceptable",         // 8.0 – 10.0
]);

export const issueSeverityEnum = pgEnum("issue_severity", [
  "critical", // accent-red
  "warning",  // accent-amber
  "good",     // accent-green
]);

// ─── Tabelas ──────────────────────────────────────────────────────────────────

export const roasts = pgTable(
  "roasts",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Código submetido
    code:       text("code").notNull(),
    language:   languageEnum("language").notNull(),
    line_count: integer("line_count").notNull(),

    // Configuração da requisição
    roast_mode: boolean("roast_mode").notNull().default(false),

    // Resultado da IA
    score:         numeric("score", { precision: 3, scale: 1 }).notNull(),
    verdict:       verdictEnum("verdict").notNull(),
    roast_text:    text("roast_text").notNull(),
    suggested_fix: text("suggested_fix"), // nullable

    // Leaderboard
    on_leaderboard: boolean("on_leaderboard").notNull().default(false),

    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("roasts_leaderboard_idx").on(table.on_leaderboard, table.score),
    index("roasts_created_at_idx").on(table.created_at),
  ],
);

export const roastIssues = pgTable(
  "roast_issues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roast_id: uuid("roast_id")
      .notNull()
      .references(() => roasts.id, { onDelete: "cascade" }),

    severity:    issueSeverityEnum("severity").notNull(),
    title:       varchar("title", { length: 120 }).notNull(),
    description: text("description").notNull(),
    position:    smallint("position").notNull(), // ordem de exibição: 0, 1, 2, 3
  },
  (table) => [
    index("roast_issues_roast_id_idx").on(table.roast_id),
  ],
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type Roast      = typeof roasts.$inferSelect;
export type NewRoast   = typeof roasts.$inferInsert;
export type RoastIssue    = typeof roastIssues.$inferSelect;
export type NewRoastIssue = typeof roastIssues.$inferInsert;
```

---

### Enums (detalhes)

```ts
// src/db/schema.ts

export const languageEnum = pgEnum("language", [
  "javascript",
  "typescript",
  "python",
  "sql",
  "go",
  "rust",
  "java",
  "php",
  "ruby",
  "other",
]);

// Baseado nas faixas de score do design:
// critical (0–2): "needs_serious_help"
// warning  (2–5): "questionable"
// ok       (5–8): "mediocre"
// good     (8–10): "acceptable"
export const verdictEnum = pgEnum("verdict", [
  "catastrophic",      // 0.0 – 1.9
  "needs_serious_help", // 2.0 – 3.9
  "questionable",      // 4.0 – 5.9
  "mediocre",          // 6.0 – 7.9
  "acceptable",        // 8.0 – 10.0
]);

export const issueSeverityEnum = pgEnum("issue_severity", [
  "critical",  // dot vermelho (accent-red)
  "warning",   // dot amarelo (accent-amber)
  "good",      // dot verde   (accent-green)
]);
```

---

### Tabela: `roasts`

Cada linha representa uma submissão de código e o resultado gerado pela IA.

```ts
export const roasts = pgTable("roasts", {
  id: uuid("id").primaryKey().defaultRandom(),

  // --- Código submetido ---
  code:       text("code").notNull(),
  language:   languageEnum("language").notNull(),
  line_count: integer("line_count").notNull(),

  // --- Configuração da requisição ---
  roast_mode: boolean("roast_mode").notNull().default(false),

  // --- Resultado da IA ---
  score:         numeric("score", { precision: 3, scale: 1 }).notNull(), // ex: 3.5
  verdict:       verdictEnum("verdict").notNull(),
  roast_text:    text("roast_text").notNull(),     // a frase brutal
  suggested_fix: text("suggested_fix"),            // código corrigido (nullable)

  // --- Leaderboard ---
  // true quando score <= threshold para aparecer no leaderboard da vergonha
  on_leaderboard: boolean("on_leaderboard").notNull().default(false),

  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
```

**Índices necessários:**

```ts
// Para a query do leaderboard (ORDER BY score ASC, filtro on_leaderboard)
index("roasts_leaderboard_idx").on(roasts.on_leaderboard, roasts.score),

// Para stats da homepage (COUNT, AVG score)
index("roasts_created_at_idx").on(roasts.created_at),
```

---

### Tabela: `roast_issues`

Cards de análise detalhada exibidos na tela de resultado (Screen 2 do design).
Cada roast tem entre 2–4 issues com severidade visual (critical / warning / good).

```ts
export const roastIssues = pgTable("roast_issues", {
  id:       uuid("id").primaryKey().defaultRandom(),
  roast_id: uuid("roast_id")
    .notNull()
    .references(() => roasts.id, { onDelete: "cascade" }),

  severity:    issueSeverityEnum("severity").notNull(),
  title:       varchar("title", { length: 120 }).notNull(),
  description: text("description").notNull(),
  position:    smallint("position").notNull(), // ordem de exibição (0, 1, 2, 3)
});
```

**Índice:**

```ts
index("roast_issues_roast_id_idx").on(roastIssues.roast_id),
```

---

## Estrutura de arquivos

```
src/
└── db/
    ├── index.ts       — instância do cliente postgres + drizzle
    ├── schema.ts      — todas as tabelas, enums e relações
    └── queries/
        ├── roasts.ts  — getLeaderboard(), getRoastById(), createRoast(), getStats()
        └── issues.ts  — createRoastIssues()
drizzle/
└── migrations/        — gerado pelo drizzle-kit (não editar manualmente)
drizzle.config.ts
docker-compose.yml
```

---

## Arquivos de configuração

### `drizzle.config.ts`

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out:    "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### `src/db/index.ts`

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

---

## Scripts npm (adicionar ao `package.json`)

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate":  "drizzle-kit migrate",
    "db:studio":   "drizzle-kit studio",
    "db:push":     "drizzle-kit push"
  }
}
```

---

## Checklist de implementação

### Setup

- [ ] Instalar `drizzle-orm`, `postgres`, `drizzle-kit`
- [ ] Criar `docker-compose.yml`
- [ ] Criar `.env.local` com `DATABASE_URL`
- [ ] Adicionar `.env.local` ao `.gitignore` (verificar se já está)
- [ ] Criar `drizzle.config.ts`

### Schema

- [ ] Criar `src/db/schema.ts` com enums (`language`, `verdict`, `issue_severity`)
- [ ] Criar tabela `roasts` com todos os campos e índices
- [ ] Criar tabela `roast_issues` com FK e índices
- [ ] Criar `src/db/index.ts` com cliente Drizzle

### Migrations

- [ ] Rodar `npm run db:generate` para gerar a primeira migration
- [ ] Rodar `npm run db:migrate` para aplicar no Postgres local
- [ ] Verificar schema no `npm run db:studio`

### Queries

- [ ] `getStats()` — retorna `{ totalRoasts, avgScore }` para a homepage
- [ ] `getLeaderboard(limit?)` — retorna os N piores codes (`on_leaderboard = true ORDER BY score ASC`)
- [ ] `getRoastById(id)` — retorna um roast completo com suas issues (join)
- [ ] `createRoast(data)` — insere roast + issues em transação

### Integração com Next.js

- [ ] Criar Server Action `src/app/actions/roast.ts` que:
  - Recebe `{ code, roastMode }` do `RoastForm`
  - Detecta linguagem (ou recebe do cliente)
  - Chama a API de IA (Claude / OpenAI)
  - Faz parse da resposta da IA para o schema
  - Persiste via `createRoast()`
  - Redireciona para `/roast/[id]`
- [ ] Criar rota `src/app/roast/[id]/page.tsx` (Screen 2 do design)
- [ ] Criar rota `src/app/leaderboard/page.tsx` (Screen 3 do design)
- [ ] Substituir dados mockados da homepage por `getStats()` e `getLeaderboard(3)`

---

## Notas de design para o schema

- **`score`** é `numeric(3,1)` para guardar valores como `3.5`, `10.0`
- **`on_leaderboard`** é derivado no momento da inserção: scores abaixo de ~4.0 entram automaticamente (threshold a definir)
- **`suggested_fix`** é nullable pois a IA pode não gerar um fix para todos os casos
- **`language`** futuramente pode ser detectada automaticamente pelo back-end (via IA ou heurística), mas por ora vem do cliente
- Não há autenticação no MVP, então não há tabela de `users`
