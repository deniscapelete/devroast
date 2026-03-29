# tRPC — Padrões e Convenções

Documentação dos padrões estabelecidos para tRPC v11 + TanStack Query v5 neste projeto.

## Estrutura de arquivos

```
src/trpc/
├── init.ts              — Inicialização do tRPC: contexto, baseProcedure, createTRPCRouter
├── query-client.ts      — Fábrica do QueryClient com configuração de SSR
├── client.tsx           — Provider client-side + hook useTRPC()
├── server.tsx           — Proxy server-side, HydrateClient, prefetch helpers
└── routers/
    ├── _app.ts          — AppRouter: agrega todos os sub-roteadores
    └── roasts.ts        — Procedures do domínio "roasts"
```

O handler HTTP fica em `src/app/api/trpc/[trpc]/route.ts`.

---

## Contexto (`init.ts`)

- O contexto inclui apenas `{ db }` (instância do Drizzle)
- `createTRPCContext` é envolvido com `cache()` do React para memoizar por request no servidor
- Exportações obrigatórias de `init.ts`: `createTRPCContext`, `createTRPCRouter`, `baseProcedure`

```ts
export const createTRPCContext = cache(async () => {
  return { db };
});
const t = initTRPC.context<Context>().create();
export const createTRPCRouter = t.router;
export const baseProcedure = t.procedure;
```

---

## Adicionando um novo roteador

1. Crie `src/trpc/routers/[dominio].ts` usando `createTRPCRouter` e `baseProcedure`
2. Registre no `_app.ts`:

```ts
// routers/_app.ts
import { novoRouter } from "./novo";
export const appRouter = createTRPCRouter({
  roasts: roastsRouter,
  novo: novoRouter,   // ← adicionar aqui
});
```

Nunca adicione procedures diretamente em `_app.ts` — agrupe sempre por domínio.

---

## Definindo procedures

### Query (leitura)

```ts
export const roastsRouter = createTRPCRouter({
  getById: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.roasts.findFirst({
        where: eq(roastsTable.id, input.id),
      });
    }),
});
```

### Mutation (escrita)

```ts
submit: baseProcedure
  .input(z.object({
    code: z.string(),
    language: z.string(),
    roastMode: z.enum(["light", "brutal"]),
  }))
  .mutation(async ({ ctx, input }) => {
    // ...
  }),
```

**Convenções de nomenclatura:**
| Operação | Prefixo | Exemplo |
|----------|---------|---------|
| Buscar um registro | `get` | `getById`, `getStats` |
| Listar registros | `list` | `listLeaderboard` |
| Criar / enviar | `create` / `submit` | `submit`, `createRoast` |
| Atualizar | `update` | `updateScore` |
| Remover | `delete` | `deleteRoast` |

- Validação de input sempre via Zod dentro de `.input()`
- Acesso ao banco sempre via `ctx.db`

---

## Usando em Server Components

Importe `trpc` e `HydrateClient` de `@/trpc/server`:

```tsx
// app/alguma-pagina/page.tsx (Server Component)
import { trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/server";

export default async function Page() {
  // Prefetch executa a query no servidor sem HTTP
  await trpc.roasts.getStats.prefetch();

  return (
    <HydrateClient>
      {/* Componentes client que usam useTRPC() receberão dados já hidratados */}
      <StatsNumbers />
    </HydrateClient>
  );
}
```

- Use `trpc.[router].[procedure].prefetch()` para prefetch de queries
- Sempre envolva os filhos com `<HydrateClient>` para passar o cache servidor → cliente
- `trpc` é o proxy server-only — não importar em client components

---

## Usando em Client Components

Importe `useTRPC` de `@/trpc/client` e use com `useQuery` / `useMutation` do TanStack Query:

```tsx
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function MeuComponente() {
  const trpc = useTRPC();

  // Query
  const { data } = useQuery(trpc.roasts.getStats.queryOptions());

  // Mutation
  const { mutate } = useMutation(trpc.roasts.submit.mutationOptions());

  return ...;
}
```

- Sempre chame `useTRPC()` dentro do componente (não no módulo)
- Use `.queryOptions()` para queries e `.mutationOptions()` para mutations
- Não use `trpc` de `@/trpc/server` em client components — causa erro

---

## QueryClient (`query-client.ts`)

- `staleTime: 30_000` — queries não refazem request por 30s após o fetch inicial
- Dehydration inclui queries com status `"pending"` para suportar streaming SSR

---

## Provider no layout

`TRPCReactProvider` (de `@/trpc/client`) já envolve toda a aplicação em `src/app/layout.tsx`. Não adicione outro provider.
