# Atlas Web

Frontend do Atlas, plataforma colaborativa de gerenciamento de tarefas em boards Kanban.

## Tecnologias

Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Axios, React Hook Form e Zod.

## Como executar

```bash
yarn install
```

Copie `.env.example` para `.env.local` e configure:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

Depois execute:

```bash
yarn dev
```

## Verificações

```bash
yarn lint
yarn typecheck
yarn build
```
