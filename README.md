# Atlas

O **Atlas** é uma plataforma colaborativa de gerenciamento de projetos baseada em Kanban.
Ela reúne boards, tarefas, membros, comentários, convites e notificações em tempo real em uma
interface responsiva com suporte a temas claro e escuro.

O projeto é dividido em uma API NestJS, uma aplicação Web Next.js e um banco PostgreSQL. Todo o
ambiente pode ser iniciado com Docker Compose.

## Funcionalidades

- Cadastro, login, refresh de sessão e logout com JWT.
- Criação e gerenciamento de boards.
- Controle de acesso por papel: administrador e colaborador.
- Colunas Kanban e movimentação de tarefas com drag and drop.
- Responsáveis, usuários compartilhados, prioridades, prazos e tags.
- Checklist e comentários em tarefas.
- Convites para boards por e-mail e por notificação autenticada.
- Notificações persistentes, paginadas e em tempo real com Socket.IO.
- Contador de não lidas e marcação individual ou em massa.
- Recuperação de notificações recebidas enquanto o usuário estava offline.
- Interface responsiva e acessível.
- Temas claro, escuro e conforme o sistema.
- Documentação interativa da API com Swagger.

## Tecnologias

### Web

- Next.js 16 com App Router e output standalone.
- React 19.
- TypeScript 5 em modo estrito.
- Tailwind CSS 4.
- shadcn/ui e Base UI.
- TanStack Query 5.
- Axios com interceptors e refresh automático do access token.
- Socket.IO Client.
- React Hook Form e Zod.
- dnd-kit.
- Lucide React.
- Sonner.
- next-themes.

### API

- Node.js 22.
- NestJS 11.
- TypeScript.
- Prisma ORM 7.
- PostgreSQL 17.
- Passport e JWT.
- Socket.IO com autenticação por JWT.
- class-validator e class-transformer.
- Swagger/OpenAPI.
- Pino.
- bcrypt.

### Infraestrutura

- Docker e Docker Compose.
- Imagens multi-stage para API e Web.
- Next.js standalone em produção.
- Migrations automáticas com `prisma migrate deploy`.
- Healthchecks para PostgreSQL, API e Web.
- Volume persistente para o PostgreSQL.

## Quick start com Docker

### Pré-requisitos

- Docker Desktop ou Docker Engine com Compose.
- Portas `3000`, `3001` e `5432` disponíveis.

### 1. Configure o ambiente

Copie o arquivo de exemplo da raiz:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

Altere pelo menos:

```dotenv
JWT_ACCESS_SECRET=um-segredo-de-acesso-forte
JWT_REFRESH_SECRET=um-segredo-de-refresh-forte
```

### 2. Inicie a aplicação

```bash
docker compose up --build -d
```

O Compose:

1. Inicia o PostgreSQL.
2. Aguarda o banco ficar saudável.
3. Executa as migrations pendentes.
4. Inicia a API.
5. Aguarda a API ficar saudável.
6. Inicia a aplicação Web.

### 3. Acesse

| Serviço | Endereço |
| --- | --- |
| Atlas Web | http://localhost:3001 |
| Atlas API | http://localhost:3000 |
| Swagger | http://localhost:3000/docs |
| PostgreSQL | `localhost:5432` |

### Comandos úteis

```bash
# Exibir o estado dos serviços
docker compose ps

# Acompanhar todos os logs
docker compose logs -f

# Acompanhar somente API ou Web
docker compose logs -f api
docker compose logs -f web

# Reconstruir após mudanças
docker compose up --build -d

# Encerrar preservando o banco
docker compose down

# Encerrar e remover também os dados persistidos
docker compose down -v
```

> `docker compose down -v` remove definitivamente o volume do PostgreSQL.

## Execução local para desenvolvimento

Use esta opção quando quiser executar API e Web com hot reload, mantendo apenas o PostgreSQL no
Docker.

### Pré-requisitos

- Node.js 22.
- Yarn 1.x.
- Docker.

### 1. Inicie o PostgreSQL

```bash
docker compose up -d postgres
```

### 2. Configure e inicie a API

```bash
cd api
cp .env.example .env
yarn install
yarn prisma generate
yarn prisma migrate dev
yarn start:dev
```

No arquivo `api/.env`, configure ao menos:

```dotenv
DATABASE_URL="postgresql://atlas:atlas@localhost:5432/atlas?schema=public"
CORS_ORIGINS="http://localhost:3001"
FRONTEND_URL="http://localhost:3001"
JWT_ACCESS_SECRET="um-segredo-de-acesso-forte"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="um-segredo-de-refresh-forte"
JWT_REFRESH_EXPIRES_IN="7d"
```

A API ficará disponível em `http://localhost:3000`.

### 3. Configure e inicie a Web

Em outro terminal:

```bash
cd web
cp .env.example .env
yarn install
yarn dev
```

No arquivo `web/.env`:

```dotenv
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

A Web ficará disponível em `http://localhost:3001`.

## Estrutura do projeto

```text
atlas-board/
├── api/                    # API NestJS, Prisma e migrations
│   ├── prisma/
│   └── src/
├── web/                    # Aplicação Next.js
│   └── src/
├── html/                   # Referências visuais
├── docker-compose.yml
└── .env.example
```

## Scripts principais

### Web

```bash
yarn dev
yarn lint
yarn typecheck
yarn build
yarn start
```

### API

```bash
yarn start:dev
yarn prisma generate
yarn prisma migrate dev
yarn build
yarn start:prod
```

## Variáveis do Docker Compose

As variáveis estão documentadas em [.env.example](.env.example):

| Variável | Finalidade | Padrão local |
| --- | --- | --- |
| `POSTGRES_USER` | Usuário do PostgreSQL | `atlas` |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL | `atlas` |
| `POSTGRES_DB` | Banco da aplicação | `atlas` |
| `API_PORT` | Porta pública da API | `3000` |
| `WEB_PORT` | Porta pública da Web | `3001` |
| `NEXT_PUBLIC_API_URL` | URL da API utilizada pelo navegador | `http://localhost:3000` |
| `CORS_ORIGINS` | Origens autorizadas pela API e Socket.IO | `http://localhost:3001` |
| `FRONTEND_URL` | URL usada nos links de convite | `http://localhost:3001` |
| `JWT_ACCESS_SECRET` | Segredo do access token | obrigatório em produção |
| `JWT_ACCESS_EXPIRES_IN` | Validade do access token | `15m` |
| `JWT_REFRESH_SECRET` | Segredo do refresh token | obrigatório em produção |
| `JWT_REFRESH_EXPIRES_IN` | Validade do refresh token | `7d` |

`NEXT_PUBLIC_API_URL` é incorporada ao bundle durante o build da Web. Ao alterar essa URL, reconstrua
a imagem:

```bash
docker compose build web
docker compose up -d web
```

## Banco de dados

As migrations ficam em `api/prisma/migrations`.

No ambiente Docker, migrations pendentes são aplicadas automaticamente antes da inicialização da
API. Os dados são persistidos no volume `atlas_postgres_data`.

Para consultar o banco local pelo container:

```bash
docker exec -it atlas-postgres psql -U atlas -d atlas
```

## Segurança

- Troque os segredos JWT antes de publicar o projeto.
- Não versione arquivos `.env`.
- Use HTTPS e URLs públicas corretas em produção.
- Não exponha diretamente a porta do PostgreSQL em ambientes públicos.
- Restrinja `CORS_ORIGINS` aos domínios autorizados.

## Status

O Atlas está em desenvolvimento ativo.
