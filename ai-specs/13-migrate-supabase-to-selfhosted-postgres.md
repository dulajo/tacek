# Migrace z Supabase na self-hosted PostgreSQL

## Overview
Supabase free tier uspává databázi po 7 dnech neaktivity, což je problém pro aplikaci používanou jednou za ~2 týdny. Řešením je self-hosted PostgreSQL + Express API server v Docker Compose, běžící v LXC kontejneru na Proxmoxu.

## Goals
- Eliminovat závislost na Supabase (a problém s uspáváním)
- Zachovat stávající frontend beze změn UI
- Vytvořit jednoduchý REST API backend
- Vše běží v jednom LXC kontejneru na Proxmoxu přes Docker Compose

## Requirements

### Functional Requirements

#### Backend (nový `server/` adresář v rootu projektu)
- [ ] Express REST API server v TypeScript
- [ ] Prisma jako ORM s PostgreSQL
- [ ] REST endpointy mapující stávající `IDataRepository` interface:
  - `GET/POST /api/members`, `PUT/DELETE /api/members/:id`
  - `GET/POST /api/menu-items`, `PUT/DELETE /api/menu-items/:id`
  - `GET/POST /api/events`, `GET/PUT/DELETE /api/events/:id`
  - `GET /api/events/:eventId/consumptions`, `PUT /api/events/:eventId/consumptions/:memberId`, `DELETE /api/events/:eventId/consumptions/:memberId`
  - `POST /api/clear-all` (bulk delete)
- [ ] Prisma schéma odpovídající stávajícímu DB schématu (`migrations.sql`):
  - Tabulky: `members`, `menu_items`, `events`, `event_members`, `event_preset_items`, `member_consumptions`, `consumption_items`, `consumption_shared_items`
  - Zachovat stejné relace, constraints a kaskádové mazání
- [ ] CORS povolený pro frontend origin
- [ ] Základní error handling (400, 404, 500 s JSON odpovědí)

#### Frontend (úpravy stávajícího kódu)
- [ ] Nový `ApiRepository` implementující `IDataRepository`
  - Volá REST API přes `fetch` místo Supabase klienta
  - Env proměnná `VITE_API_URL` pro URL backendu (default: `/api` pro produkci s reverse proxy)
- [ ] Nahradit `SupabaseRepository` za `ApiRepository` v místě kde se repository instanciuje
- [ ] Odstranit Supabase závislosti:
  - `@supabase/supabase-js` z `package.json`
  - `src/lib/supabase.ts`
  - `src/types/database.ts` (Supabase generated types)
  - `src/utils/migrateToSupabase.ts`
  - `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` z `.env.example`
  - Supabase-related dokumenty: `SUPABASE_IMPLEMENTATION.md`, `SUPABASE_OPTIMIZATION.md`, `SUPABASE_SETUP.md`, `supabase_indexes.sql`
- [ ] Zachovat `LocalStorageRepository` jako fallback (beze změn)
- [ ] Zachovat `IDataRepository` interface (beze změn)

#### Docker Compose (`docker-compose.yml` v rootu)
- [ ] Služba `postgres` – PostgreSQL 16, persistent volume, health check
- [ ] Služba `api` – Node.js, Express server, závisí na `postgres`
  - Při startu spustí `prisma migrate deploy`
- [ ] Služba `nginx` – servíruje frontend static files + reverse proxy `/api` na `api` službu
  - Nginx config: `/` → static files, `/api` → proxy pass na api:3000
- [ ] Porty: pouze nginx vystavený na host (port 80)
- [ ] `.env` soubor pro Docker Compose s `DATABASE_URL`, `POSTGRES_PASSWORD` atd.

#### Deployment (aktualizace `deployment/`)
- [ ] Aktualizovat deployment skripty pro nový setup:
  - LXC kontejner potřebuje Docker + Docker Compose
  - Deploy: build frontend (`pnpm build`), push do LXC, `docker compose up -d`
- [ ] Aktualizovat `deployment/README.md` – odstranit Supabase kroky, přidat Docker Compose setup
- [ ] Deployment skript pro build a push na LXC

#### Migrace dat
- [ ] Skript `scripts/migrate-from-supabase.ts` pro jednorázový export dat ze Supabase a import do nového Postgresu
  - Čte ze Supabase (potřebuje staré env proměnné)
  - Zapisuje do nového Postgresu přes Prisma
  - Migruje všechny tabulky se zachováním ID a relací

### Non-Functional Requirements
- [ ] Použít `pnpm` jako package manager (konzistence s druhou aplikací)
- [ ] Backend i frontend v jednom monorepo (ne oddělené repozitáře)
- [ ] TypeScript strict mode na backendu

## Technical Approach

### Struktura projektu
```
tacek/
├── server/                    # Nový backend
│   ├── src/
│   │   ├── index.ts           # Express app entry point
│   │   ├── routes/
│   │   │   ├── members.ts
│   │   │   ├── menuItems.ts
│   │   │   ├── events.ts
│   │   │   └── consumptions.ts
│   │   └── lib/
│   │       └── prisma.ts      # Prisma client instance
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
├── src/                       # Stávající frontend (Vite + React)
│   ├── repositories/
│   │   ├── IDataRepository.ts # Beze změn
│   │   ├── ApiRepository.ts   # Nový – volá REST API
│   │   ├── LocalStorageRepository.ts  # Beze změn
│   │   └── SupabaseRepository.ts      # SMAZAT
│   └── ...
├── docker-compose.yml
├── Dockerfile.api             # Multi-stage build pro API server
├── Dockerfile.nginx           # Nginx + frontend static files
├── nginx.conf                 # Nginx config (reverse proxy)
├── scripts/
│   └── migrate-from-supabase.ts
├── package.json               # Frontend package.json
└── pnpm-workspace.yaml        # Monorepo workspace config (pokud potřeba)
```

### API konvence
- JSON request/response bodies
- Camel case v JSON (frontend modely), Prisma mapuje na snake_case v DB
- HTTP status kódy: 200 (OK), 201 (Created), 204 (No Content pro DELETE), 400 (Bad Request), 404 (Not Found), 500 (Internal Server Error)

### Nginx reverse proxy
```
location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;  # SPA fallback
}

location /api/ {
    proxy_pass http://api:3000/api/;
}
```

## Constraints
- Stávající frontend UI se nesmí měnit
- `IDataRepository` interface se nesmí měnit
- Data ze Supabase musí být migrovatelná (jednorázový skript)
- LXC kontejner musí podporovat Docker (nested virtualization nebo privileged container)
- Vše v jednom LXC kontejneru (frontend, backend, databáze)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| API server nedostupný | Frontend zobrazí chybovou hlášku (stávající error handling v repository) |
| Postgres restart | API server se reconnectne automaticky (Prisma connection pool) |
| Prázdná databáze (první spuštění) | `prisma migrate deploy` vytvoří schéma, appka funguje s prázdnými daty |
| Souběžný přístup 2-5 uživatelů | PostgreSQL + Prisma zvládne bez problémů |
| Velký event s mnoha consumptions | Stejné nested queries jako v Supabase, Prisma `include` |

## Acceptance Criteria
1. `docker compose up` spustí celý stack (postgres + api + nginx) v jednom příkazu
2. Frontend na `http://localhost` funguje identicky jako se Supabase
3. Všechny CRUD operace fungují (members, menu items, events, consumptions)
4. Data přežijí restart kontejnerů (persistent volume pro postgres)
5. Migrace dat ze Supabase proběhne úspěšně (skript)
6. Žádná závislost na Supabase v kódu ani v `package.json`
7. Deploy na Proxmox LXC funguje dle aktualizovaného návodu

## Out of Scope
- Autentizace/autorizace (stávající stav – žádná auth)
- CI/CD pipeline
- Automatické zálohy databáze (lze přidat později)
- Monitoring/logging beyond console.log
- Přepis frontendu na Next.js
- HTTPS (řeší Nginx Proxy Manager na Proxmoxu, ne tato aplikace)
