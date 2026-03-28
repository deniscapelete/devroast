# Spec: tRPC + TanStack Query (App Router)

## Contexto

O projeto precisa de uma camada de API tipada para conectar os Server Actions/rotas ao front-end. tRPC resolve isso com:
- Type-safety de ponta a ponta (router → client) sem codegen
- Integração nativa com TanStack Query (cache, loading states, mutações)
- SSR com prefetch no servidor + hydration para client components

Substituirá os dados mockados de `page.tsx` (stats, leaderboard) e servirá como camada para o fluxo de roast.

---

## Decisão

Usar `@trpc/tanstack-react-query` (nova integração, não o adapter clássico). Padrão oficial para Next.js App Router:
- Server Components usam `trpc` de `src/trpc/server.tsx` — chamadas diretas sem HTTP, cache por `react.cache`
- Client Components usam `useTRPC()` de `src/trpc/client.tsx` — TanStack Query hooks normais
- `HydrateClient` + `prefetch` para passar dados do servidor para o cliente sem dupla-fetch

---

## Estrutura de arquivos tRPC

```
src/trpc/
├── init.ts            — initTRPC, contexto, exports base
├── query-client.ts    — makeQueryClient com options SSR
├── routers/
│   ├── _app.ts        — appRouter (merge de sub-routers)
│   └── roasts.ts      — procedimentos do domínio roast
├── client.tsx         — TRPCReactProvider + useTRPC (client-only)
└── server.tsx         — trpc proxy + HydrateClient + prefetch (server-only)

src/app/api/trpc/[trpc]/
└── route.ts           — fetch handler (GET + POST)
```

---

## Detalhes de implementação

### `src/trpc/init.ts`

```ts
import { initTRPC } from '@trpc/server';
import { cache } from 'react';
import { db } from '@/db';

export const createTRPCContext = cache(async () => {
  return { db };
});

const t = initTRPC.context<typeof createTRPCContext>().create();

export const createTRPCRouter  = t.router;
export const baseProcedure     = t.procedure;
export const createCallerFactory = t.createCallerFactory;
```

### `src/trpc/query-client.ts`

```ts
import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30 * 1000 },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  });
}
```

`staleTime: 30s` evita refetch imediato no cliente após SSR. `shouldDehydrateQuery` estendido habilita streaming de queries `pending`.

### `src/trpc/routers/roasts.ts`

Procedimentos iniciais (expandir conforme o fluxo de roast for implementado):

```ts
import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';

export const roastsRouter = createTRPCRouter({
  getStats: baseProcedure.query(async ({ ctx }) => {
    // SELECT count(*), avg(score) FROM roasts
  }),

  getLeaderboard: baseProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      // SELECT ... FROM roasts WHERE on_leaderboard = true ORDER BY score ASC LIMIT limit
    }),

  getById: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // SELECT roast + issues JOIN
    }),

  submit: baseProcedure
    .input(z.object({
      code:      z.string().min(1).max(5000),
      language:  z.string(),
      roastMode: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. chamar IA
      // 2. persistir via createRoast()
      // 3. retornar { id }
    }),
});
```

### `src/trpc/routers/_app.ts`

```ts
import { createTRPCRouter } from '../init';
import { roastsRouter } from './roasts';

export const appRouter = createTRPCRouter({
  roasts: roastsRouter,
});

export type AppRouter = typeof appRouter;
```

### `src/app/api/trpc/[trpc]/route.ts`

```ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
```

### `src/trpc/client.tsx`

```tsx
'use client';

import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import { makeQueryClient } from './query-client';
import type { AppRouter } from './routers/_app';

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient;
function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

function getUrl() {
  if (typeof window !== 'undefined') return '/api/trpc';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api/trpc`;
  return 'http://localhost:3000/api/trpc';
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: getUrl() })],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
```

### `src/trpc/server.tsx`

```tsx
import 'server-only';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { TRPCQueryOptions } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

export function HydrateClient({ children }: { children: React.ReactNode }) {
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      {children}
    </HydrationBoundary>
  );
}

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const qc = getQueryClient();
  if (queryOptions.queryKey[1]?.type === 'infinite') {
    void qc.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void qc.prefetchQuery(queryOptions);
  }
}
```

`getQueryClient` é memoizado por request via `react.cache`. `HydrateClient` e `prefetch` são helpers para simplificar o padrão nas pages.

---

## Padrão de uso por tipo de componente

### Server Component com hydration para o cliente

```tsx
// app/page.tsx
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { StatsClient } from './stats-client';

export default async function HomePage() {
  prefetch(trpc.roasts.getStats.queryOptions());
  prefetch(trpc.roasts.getLeaderboard.queryOptions({ limit: 3 }));

  return (
    <HydrateClient>
      <StatsClient />
    </HydrateClient>
  );
}
```

### Client Component

```tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

export function StatsClient() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.roasts.getStats.queryOptions());
  // data já vem pré-populado do servidor via HydrateClient
}
```

### Server Component com dado direto (sem hydration)

```tsx
import { trpc, getQueryClient } from '@/trpc/server';

export default async function RoastPage({ params }: { params: { id: string } }) {
  const roast = await getQueryClient().fetchQuery(
    trpc.roasts.getById.queryOptions({ id: params.id })
  );
  // usar roast direto no JSX
}
```

---

## Arquivos a criar/modificar

| Arquivo | Operação | Descrição |
|---|---|---|
| `src/trpc/init.ts` | Criar | initTRPC, contexto com `db`, exports base |
| `src/trpc/query-client.ts` | Criar | `makeQueryClient` com opções SSR |
| `src/trpc/routers/roasts.ts` | Criar | Procedimentos: `getStats`, `getLeaderboard`, `getById`, `submit` |
| `src/trpc/routers/_app.ts` | Criar | `appRouter` mergeando sub-routers + `AppRouter` type |
| `src/trpc/client.tsx` | Criar | `TRPCReactProvider` + `useTRPC` (client-only) |
| `src/trpc/server.tsx` | Criar | `trpc` proxy + `HydrateClient` + `prefetch` (server-only) |
| `src/app/api/trpc/[trpc]/route.ts` | Criar | Fetch handler GET + POST |
| `src/app/layout.tsx` | Modificar | Envolver `children` em `<TRPCReactProvider>` |
| `package.json` | Modificar | Adicionar deps |

---

## Checklist de implementação

### Fase 1 — Instalação

- [ ] Instalar dependências:
  ```bash
  npm install @trpc/server @trpc/client @trpc/tanstack-react-query @tanstack/react-query zod server-only
  ```

### Fase 2 — Infraestrutura tRPC

- [ ] Criar `src/trpc/init.ts` com contexto recebendo `db`
- [ ] Criar `src/trpc/query-client.ts`
- [ ] Criar `src/trpc/routers/_app.ts` (router vazio inicial)
- [ ] Criar `src/app/api/trpc/[trpc]/route.ts`
- [ ] Criar `src/trpc/client.tsx` com `TRPCReactProvider` e `useTRPC`
- [ ] Criar `src/trpc/server.tsx` com `trpc`, `HydrateClient`, `prefetch`
- [ ] Modificar `src/app/layout.tsx` para envolver com `TRPCReactProvider`

### Fase 3 — Router de roasts

- [ ] Criar `src/trpc/routers/roasts.ts` com procedimentos stubados (retorno mockado por ora)
- [ ] Adicionar `roastsRouter` ao `appRouter`
- [ ] Verificar type-safety end-to-end: chamar `trpc.roasts.getStats` no server e client sem erros de TS

### Fase 4 — Integração nas pages

- [ ] `src/app/page.tsx`: substituir dados mockados por `prefetch(trpc.roasts.getStats)` + `prefetch(trpc.roasts.getLeaderboard)` + `HydrateClient`
- [ ] `src/app/leaderboard/page.tsx`: idem com `getLeaderboard` completo
- [ ] `src/app/roast/[id]/page.tsx`: usar `getQueryClient().fetchQuery(trpc.roasts.getById)` para dados SSR

### Fase 5 — Qualidade

- [ ] Rodar `npm run check` (Biome) sem erros
- [ ] Rodar `npm run build` sem erros de tipo
