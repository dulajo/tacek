# Tácek 🍺

**Kde přátelství končí a dluhy začínají**

Webová aplikace pro férový účty na hospodských kvízech. Evidence a rozdělení společné útraty skupiny přátel.

## Funkce

✅ **Správa členů skupiny**
- Core členové (pravidelní) vs. náhradníci
- Vizuální odlišení (hvězdička pro core členy)

✅ **Správa jídelního lístku**
- Globální jídelní lístek pro všechny události
- Kategorie: Jídlo, Pití, Ostatní
- Sdílené položky (vodní dýmka, atd.)

✅ **Vytváření událostí**
- Varianta A: S účtenkou (přednastavené produkty)
- Varianta B: Bez účtenky (jen celková částka)
- Výběr přítomných členů
- Zadání platiče a celkové částky
- Zadání dýška/spropitného
- **NOVÉ:** Auto-save draft - rozpracovaná událost se automaticky ukládá

✅ **Editace událostí**
- **NOVÉ:** Možnost upravit existující událost
- Změna základních údajů (datum, název, členové, částky)
- Úprava produktů z účtenky
- Varování při editaci uzavřených událostí
- Automatický přepočet všech částek

✅ **Zadávání konzumace**
- Každý člen si zaklikne svou konzumaci
- Live přepočet částek
- Přihlášení ke sdíleným položkám
- Proporcionální rozdělení dýška
- **NOVÉ:** Detailní zobrazení s rozdělením na běžné/sdílené položky a dýško

✅ **Kontrola a validace**
- Varování při nesouladu s účtenkou
- Zobrazení rozdílu oproti celkové částce

✅ **Evidence plateb**
- Checkbox pro každého člena
- Vizuální indikace kdo zaplatil

✅ **Historie událostí**
- Seznam všech událostí
- Detail každé události
- Možnost znovu otevřít uzavřenou událost

✅ **Sdílení**
- Sdílitelný link na konkrétní událost
- Přístup bez přihlášení

## Technologie

- **Frontend:** React 18 + TypeScript
- **Styling:** TailwindCSS
- **Router:** React Router v6
- **Databáze:** Supabase (PostgreSQL)
- **Build:** Vite

## Instalace a spuštění

### Požadavky
- Node.js 18+ a npm
- Supabase účet (zdarma na [supabase.com](https://supabase.com))

### Setup Supabase

1. **Vytvoření projektu**
   - Přihlaste se na [supabase.com](https://supabase.com)
   - Vytvořte nový projekt
   - Poznamenejte si Project URL a Publishable Key

2. **Spuštění SQL migrace**
   - V Supabase dashboardu otevřete **SQL Editor**
   - Klikněte na **New query**
   - Zkopírujte obsah souboru `migrations.sql`
   - Klikněte **Run**
   - Ověřte že se vytvořilo 8 tabulek (members, menu_items, events, ...)

3. **Optimalizace výkonu (doporučeno)**
   - V SQL Editoru spusťte také `supabase_indexes.sql`
   - Vytvoří indexy pro rychlejší queries
   - Zlepší výkon až o 3× (hlavně při velkém množství dat)

4. **Konfigurace aplikace**
   - Otevřete soubor `src/lib/supabase.ts`
   - Aktualizujte `supabaseUrl` a `supabaseKey` s vašimi credentials

### Instalace

```bash
# Instalace závislostí
npm install
```

### Vývoj

```bash
# Spuštění dev serveru
npm run dev
```

Aplikace běží na `http://localhost:5173`

### Produkce

```bash
# Build pro produkci
npm run build

# Preview produkční verze
npm run preview
```

Build vytvoří optimalizované soubory v adresáři `dist/`.

## Deployment na brosplit.dulove.cz

### Pomocí nginx

1. Build aplikace: `npm run build`
2. Zkopírujte obsah `dist/` do webroot: `/var/www/brosplit`
3. Konfigurace nginx:

```nginx
server {
    listen 80;
    server_name brosplit.dulove.cz;
    
    root /var/www/brosplit;
    index index.html;
    
    # SPA routing - všechny požadavky směruj na index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache statických souborů
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. Restart nginx: `sudo systemctl restart nginx`

### HTTPS s Let's Encrypt

```bash
sudo certbot --nginx -d brosplit.dulove.cz
```

## Datová struktura

Data jsou uložena v Supabase (PostgreSQL) databázi:

### Tabulky:
- `members` - Seznam členů
- `menu_items` - Jídelní lístek
- `events` - Události
- `event_members` - Přítomní členové na události (many-to-many)
- `event_preset_items` - Produkty z účtenky
- `member_consumptions` - Konzumace členů
- `consumption_items` - Běžné položky konzumace
- `consumption_shared_items` - Sdílené položky konzumace

### Migrace z LocalStorage

Pokud máte data v LocalStorage z předchozí verze:

1. Otevřít Developer Tools (F12)
2. Console:

```javascript
// Import utility
import('./src/utils/migrateToSupabase').then(m => {
  m.migrateLocalStorageToSupabase()
    .then(result => console.log('✅ Migration complete:', result))
    .catch(error => console.error('❌ Migration failed:', error));
});

// Nebo použít připravenou funkci
window.migrateToSupabase();
```

**POZOR:** Migrace nepřepisuje existující data v Supabase, pouze přidává nová.

### Záloha databáze

Pro zálohu Supabase databáze:

1. V Supabase dashboardu otevřete **Database**
2. Klikněte na **Backups**
3. Klikněte **Download backup**

Nebo exportujte SQL:

```sql
-- Export všech dat pomocí pg_dump (dostupné přes Supabase CLI)
supabase db dump -f backup.sql
```

## Výkon a optimalizace

Aplikace je optimalizována pro rychlé načítání dat:

- **Nested queries** - Eliminace N+1 query problému
- **Batch operations** - Paralelní insert/delete operace
- **Database indexes** - Rychlé JOINy a lookups

### Performance metriky:
- Dashboard (10 událostí): **~60ms** (před: 700ms)
- Event detail: **~30ms** (před: 100ms)
- **11× rychlejší** načítání oproti neoptimalizované verzi

Více informací: `SUPABASE_OPTIMIZATION.md`

---

## Datová struktura

Aplikace používá **Repository Pattern** pro abstrakci datového layer:

```
src/
├── types/          # TypeScript definice
├── repositories/   # Data layer
│   ├── IDataRepository.ts           # Interface
│   ├── SupabaseRepository.ts        # Supabase implementace (aktivní)
│   └── LocalStorageRepository.ts    # LocalStorage (fallback)
├── services/       # Business logika (výpočty)
├── contexts/       # React Context (globální stav)
├── pages/          # Hlavní stránky
├── lib/            # External libraries (Supabase client)
└── utils/          # Utility funkce (migrace, ...)
```

### Výhody Repository Pattern:

- **Snadný přechod mezi databázemi** - stačí vyměnit implementaci
- **Testovatelnost** - můžete použít mock repository pro testy
- **Business logika nezávislá na datasource** - všechny výpočty fungují stejně

### Aktuální konfigurace:

- **Aktivní:** `SupabaseRepository` (cloud databáze)
- **Dostupné:** `LocalStorageRepository` (browser storage)

Pro přepnutí zpět na LocalStorage:
```typescript
// V src/contexts/AppContext.tsx
import { LocalStorageRepository } from '../repositories/LocalStorageRepository';
const [repository] = useState<IDataRepository>(() => new LocalStorageRepository());
```

## Uživatelská příručka

### První spuštění

1. **Přidejte členy** - Klikněte na "Spravovat" u sekce Členové
2. **Vytvořte jídelní lístek** - Přidejte běžné položky (pivo, čaj, polévka...)
3. **Vytvořte první událost** - Klikněte na "+ Nová událost"

### Typický workflow události

1. **Vytvoření události**
   - Zadejte datum a název
   - Vyberte přítomné členy (core jsou předvyplněni)
   - Označte kdo zaplatil
   - Zadejte celkovou částku a dýško
   - Volitelně: Zadejte produkty z účtenky

2. **Zadávání konzumace**
   - Každý člen si zaklikne co měl
   - Systém průběžně počítá částky
   - Přihlaste se ke sdíleným položkám

3. **Kontrola**
   - Zkontrolujte že součet sedí s účtenkou
   - Případně opravte chyby

4. **Platby**
   - Postupně zaškrtávejte kdo zaplatil
   - Platič vidí svůj dluh jako 0 Kč

5. **Uzavření**
   - Když jsou všechny platby vyřízené, uzavřete událost

## Chybějící funkce (pro budoucí verze)

- ❌ Autentizace a přístupová práva (připraveno pro Supabase Auth)
- ✅ ~~Backend API a synchronizace mezi zařízeními~~ (implementováno přes Supabase)
- ❌ Real-time synchronizace (Supabase Realtime subscriptions)
- ❌ Více podniků s různými jídelními lístky
- ❌ Statistiky (kdo kolik utratil, jak často chodí...)
- ❌ QR kódy pro platby
- ❌ Revolut API integrace
- ❌ Email/push notifikace
- ❌ Export do PDF/Excel

## Licence

Proprietární - pouze pro interní použití skupiny.

## Kontakt

Pro bugy a feature requesty kontaktujte správce.
