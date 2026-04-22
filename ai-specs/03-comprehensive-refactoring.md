# Komplexní refaktoring Tácek aplikace – bezpečnost, výkon, best practices

## Overview
Celoplošný refaktoring React/TypeScript aplikace "Tácek" (správa hospodských účtů). Cílem je zvýšit bezpečnost (credentials v env), typovou bezpečnost (odstranit `any`), výkon (memoizace, lazy loading), čistotu kódu (extrakce komponent, odstranění duplikací) a spolehlivost (opravy bugů, unit testy).

Tech stack: React 18 + TypeScript + Vite + Tailwind CSS + Supabase + react-router-dom v6.

## Goals
- Odstranit bezpečnostní rizika (hardcoded credentials)
- Dosáhnout plné typové bezpečnosti (zero `any`)
- Snížit duplicitu kódu o ~60% (EventDetail 1525→~300 řádků, Create/Edit sdílený form)
- Opravit identifikované bugy a race conditions
- Přidat unit testy pro business logiku
- Zlepšit výkon (lazy loading, stabilní reference, memoizace)

## Requirements

### Functional Requirements

#### FR1: Bezpečnost – Environment proměnné
- [ ] Přesunout Supabase URL a klíč z `src/lib/supabase.ts` do `.env` souboru
- [ ] Číst credentials přes `import.meta.env.VITE_SUPABASE_URL` a `import.meta.env.VITE_SUPABASE_ANON_KEY`
- [ ] Přidat validaci při startu – pokud env proměnné chybí, vyhodit srozumitelnou chybu
- [ ] Vytvořit `.env.example` s placeholder hodnotami
- [ ] Ověřit že `.env` je v `.gitignore` (přidat pokud chybí)

**Aktuální kód (`src/lib/supabase.ts`):**
```typescript
const supabaseUrl = 'https://greqhsslyyanbumotlzo.supabase.co'
const supabaseKey = 'sb_publishable_0mwT_YxyH3n8Wsa0hEFHeg_wnYrkcqu'
```

**Cílový kód:**
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Check .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
```

#### FR2: Typová bezpečnost – Supabase Database Types
- [ ] Vytvořit `src/types/database.ts` s typy pro všechny Supabase tabulky:
  - `members` (id, name, is_core, revolut_username, bank_account)
  - `menu_items` (id, name, price, category, is_shared, is_favorite)
  - `events` (id, date, name, payer_id, total_amount, tip, status)
  - `event_members` (event_id, member_id, paid_self)
  - `event_preset_items` (event_id, menu_item_id, quantity)
  - `member_consumptions` (id, event_id, member_id, has_paid, total_amount)
  - `consumption_items` (consumption_id, menu_item_id, quantity)
  - `consumption_shared_items` (consumption_id, menu_item_id)
- [ ] Typovat `createClient` s database types: `createClient<Database>(url, key)`
- [ ] Odstranit všechny `any` typy v `SupabaseRepository.ts` (aktuálně ~10 výskytů: `(em: any)`, `(pi: any)`, `(item: any)`, `(s: any)`)
- [ ] Opravit `useState<any>(null)` v `EventDetail.tsx` řádek 29 → `useState<Event | null>(null)`

#### FR3: Rozdělit EventDetail.tsx na komponenty
Aktuální soubor má 1525 řádků s masivní duplikací. Rozdělit na:

- [ ] **`src/components/event/InventoryItemRow.tsx`** – Řádek s položkou menu, quantity controls a inventory tracking
  - Props: `menuItem`, `quantity`, `onIncrement`, `onDecrement`, `inventoryInfo?`, `isFavorite?`
  - Aktuálně se identický blok opakuje 4× (řádky ~890-975, ~987-1072, ~1194-1275, ~1287-1368)
  - Musí podporovat: zobrazení ceny, quantity buttons, inventory status (zbývá X/Y), přečerpání warning, skrytí depleted items

- [ ] **`src/components/event/ConsumptionForm.tsx`** – Formulář pro přidání/editaci konzumace člena
  - Props: `memberId`, `menuItems`, `sharedItems`, `editingItems`, `editingSharedIds`, `onItemQuantityChange`, `onToggleSharedItem`, `onSave`, `onCancel`, `event`, `consumptions`, `editingTotal`
  - Obsahuje: sekci běžných položek (favorites + regular), sekci sdílených položek, celkový součet, akční tlačítka
  - Aktuálně duplicitní v expanded member card (řádky ~852-1148) a bottom form (řádky ~1156-1440)

- [ ] **`src/components/event/MemberBalanceCard.tsx`** – Karta s bilancí jednoho člena
  - Props: `balance`, `consumption`, `menuItems`, `consumptions`, `event`, `isExpanded`, `onToggleExpansion`, `onTogglePaid`, `onSaveConsumption`, `editingItems`, `editingSharedIds`, `onItemQuantityChange`, `onToggleSharedItem`
  - Obsahuje: jméno, částku, status zaplacení, seznam položek, tlačítko pro rozbalení, rozbalený ConsumptionForm

- [ ] **`src/components/event/SharedItemCheckbox.tsx`** – Checkbox pro sdílenou položku s výpočtem podílu
  - Props: `menuItem`, `isChecked`, `onToggle`, `participantCount`, `sharePrice`
  - Aktuálně duplicitní 2× (expanded form + bottom form)

- [ ] **`src/components/event/EventSummaryHeader.tsx`** – Horní summary karta s info o platiči
  - Props: `event`, `payer`, `onCopySummary`

- [ ] Výsledný `EventDetail.tsx` by měl mít max ~300 řádků (state management + kompozice komponent)

#### FR4: Sdílený EventForm pro Create/Edit
- [ ] Vytvořit `src/components/event/EventForm.tsx` – sdílený formulář
  - Props: `initialData?`, `onSubmit`, `submitLabel`, `members`, `menuItems`
  - Obsahuje: základní údaje (datum, název), výběr členů (s self-paid toggle), platba (platič, částka, dýško, payer info display), produkty z účtenky
  - Interní state: `eventData`, `selectedMemberIds`, `selfPaidMemberIds`, `hasReceipt`, `presetItems`
- [ ] `CreateEvent.tsx` bude wrapper: draft management + EventForm s `onSubmit` pro vytvoření
- [ ] `EditEvent.tsx` bude wrapper: loading + warning dialog + EventForm s `initialData` a `onSubmit` pro update
- [ ] Sdílené handlery: `handleMemberToggle`, `handleSelfPaidToggle`, `handleAddPresetItem`, `handleUpdatePresetItem`, `handleRemovePresetItem`

#### FR5: Extrahovat MemberListItem a MemberForm
- [ ] Vytvořit `src/components/members/MemberListItem.tsx`
  - Props: `member`, `isEditing`, `onEdit`, `onDelete`, `onSaveEdit`, `onCancelEdit`, `editState`
  - Aktuálně identický blok se opakuje 2× v ManageMembers.tsx (core members řádky 155-229, substitute members řádky 241-319)
- [ ] Výsledný ManageMembers.tsx by měl mít max ~120 řádků

#### FR6: Opravy bugů
- [ ] **Bug: `getInventoryStatus` return type mismatch** – Funkce vrací `{ color: 'green' | 'yellow' | 'red' | 'gray' }`, ale v EventDetail.tsx se porovnává s `inventoryStatus === 'high'` / `'medium'` / `'low'` (řádky ~930, 1000, 1230, 1300). Tyto podmínky NIKDY nematchnou → inventory status coloring nefunguje. **Oprava:** Porovnávat s `inventoryStatus?.color` nebo refaktorovat na konzistentní API.

- [ ] **Bug: `handleUpdatePresetItem` mutuje state** – V CreateEvent.tsx řádek 138-143 a EditEvent.tsx řádek 107-113: `updated[index].menuItemId = value` přímo mutuje objekt v poli. **Oprava:** Vytvořit nový objekt: `updated[index] = { ...updated[index], menuItemId: value }`.

- [ ] **Bug: Chybějící error handling v `updateEvent`** – V SupabaseRepository.ts řádky 284-300 a 302-319: delete/insert event_members a event_preset_items ignorují chyby (chybí `if (error) throw error`). **Oprava:** Přidat error handling pro všechny operace.

- [ ] **Bug: Stale closure v `useEffect`** – AppContext.tsx řádek 90-91: `useEffect(() => { refreshAll(); }, [])` – `refreshAll` není v dependency array, ale to je záměr (initial load). Nicméně `refreshMembers`, `refreshMenuItems`, `refreshEvents` nejsou stabilní reference (vytvářejí se při každém renderu). **Oprava:** Zabalit do `useCallback`.

- [ ] **Bug: `useEffect` dependency v CreateEvent** – Řádek 55-59: `useEffect` závisí na `hasDraft()` a `draft`, ale nemá je v dependency array. Řádek 62-84: auto-save `useEffect` má `saveDraft` v closure ale ne v deps. **Oprava:** Přidat správné dependencies nebo použít ref.

- [ ] **Bug: Race condition v `handleTogglePaid`** – EventDetail.tsx řádky 305-338: Mezi `repository.updateConsumption` a `repository.getEventConsumptions` může dojít k race condition. **Oprava:** Použít optimistic update nebo zajistit sekvenční zpracování.

#### FR7: Unit testy pro calculationService
- [ ] Přidat Vitest jako dev dependency (`vitest`, `@vitest/coverage-v8`)
- [ ] Přidat test script do `package.json`: `"test": "vitest"`, `"test:coverage": "vitest --coverage"`
- [ ] Vytvořit `src/services/calculationService.test.ts` s testy:
  - `calculateItemsTotal`: prázdné pole, jeden item, více items, neexistující menuItem
  - `calculateTipPerMember`: 0 členů (edge case dělení nulou), 1 člen, více členů, zaokrouhlení
  - `calculateSharedItemsTotal`: žádní účastníci, 1 účastník, více účastníků, non-shared item
  - `calculateEntryFeeTotal`: žádné startovné v menu, startovné existuje, více členů
  - `calculateMemberBalance`: platič (totalOwed=0), self-paid člen, běžný člen, člen se sdílenými položkami
  - `calculateEventSummary`: kompletní scénář s více členy
  - `getRemainingQuantity`: preset > consumed, preset = consumed, preset < consumed (overdraft)
  - `calculateItemOverdraft`: žádné přečerpání, přečerpání
  - `getInventoryStatus`: všechny barevné stavy (green, yellow, red, gray)
  - `validateEventComplete`: valid event, event s rozdílem, event s neodpovídající účtenkou

### Non-Functional Requirements
- [ ] Žádné `any` typy v celém projektu (kromě `error` v catch blocích kde je to nevyhnutelné – tam použít `unknown`)
- [ ] Žádný soubor delší než 400 řádků
- [ ] Všechny nové komponenty musí mít `displayName` (pro React DevTools)
- [ ] Lazy loading pro všechny stránky (React.lazy + Suspense v App.tsx)
- [ ] Stabilní callback reference v AppContext (useCallback)
- [ ] Memoizace odvozených dat v Dashboard (useMemo pro coreMembers, substituteMembers)

## Technical Approach

### Architektura komponent po refaktoringu
```
src/
├── components/
│   ├── event/
│   │   ├── ConsumptionForm.tsx        (~150 řádků)
│   │   ├── EventForm.tsx              (~250 řádků)
│   │   ├── EventSummaryHeader.tsx     (~80 řádků)
│   │   ├── InventoryItemRow.tsx       (~80 řádků)
│   │   ├── MemberBalanceCard.tsx      (~120 řádků)
│   │   └── SharedItemCheckbox.tsx     (~40 řádků)
│   ├── members/
│   │   └── MemberListItem.tsx         (~100 řádků)
│   ├── ui/                            (beze změn)
│   ├── ErrorBoundary.tsx              (beze změn)
│   ├── LoadingBar.tsx                 (beze změn)
│   ├── Logo.tsx                       (beze změn)
│   └── QuantityControl.tsx            (beze změn)
├── pages/
│   ├── CreateEvent.tsx                (~80 řádků, wrapper)
│   ├── Dashboard.tsx                  (~200 řádků, memoizace)
│   ├── EditEvent.tsx                  (~100 řádků, wrapper)
│   ├── EventDetail.tsx                (~300 řádků, kompozice)
│   ├── ManageMembers.tsx              (~120 řádků)
│   └── ManageMenu.tsx                 (~250 řádků, minor cleanup)
├── types/
│   ├── database.ts                    (NOVÝ – Supabase types)
│   ├── date-fns.d.ts                  (beze změn)
│   └── models.ts                      (beze změn)
├── services/
│   ├── calculationService.ts          (minor fixes)
│   └── calculationService.test.ts     (NOVÝ – unit testy)
└── ...
```

### Postup implementace (doporučené pořadí)
1. **Bezpečnost** – .env soubor, credentials (nejmenší riziko regrese)
2. **Typová bezpečnost** – database.ts, odstranění `any` (základ pro další práci)
3. **Bug fixes** – opravy identifikovaných bugů
4. **Extrakce komponent** – InventoryItemRow, SharedItemCheckbox (nejmenší, nejsnáze testovatelné)
5. **ConsumptionForm** – sloučení duplicitních formulářů
6. **MemberBalanceCard** – extrakce z EventDetail
7. **EventForm** – sloučení Create/Edit
8. **MemberListItem** – extrakce z ManageMembers
9. **Výkon** – lazy loading, useCallback, useMemo
10. **Unit testy** – calculationService testy
11. **Finální cleanup** – unused imports, konzistence

### Technologie
- **Vitest** pro unit testy (nativní integrace s Vite)
- **Vite env** pro environment proměnné (`import.meta.env`)
- **React.lazy + Suspense** pro code splitting

## Constraints
- Nesmí se změnit vizuální vzhled aplikace (žádné CSS změny kromě bug fixů)
- Nesmí se změnit Supabase schema ani API
- Nesmí se změnit URL routing
- `migrateToSupabase.ts` zůstává beze změn
- `LocalStorageRepository.ts` zůstává beze změn (fallback)
- UI komponenty v `src/components/ui/` zůstávají beze změn (shadcn/ui pattern)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| `.env` soubor chybí | Aplikace vyhodí srozumitelnou chybu při startu s instrukcí co udělat |
| Supabase vrátí null pro nested relation | Typově bezpečný fallback na prázdné pole (už existuje, ale s `any`) |
| Prázdný event (0 členů, 0 položek) | Všechny výpočty vrátí 0, žádné dělení nulou |
| Concurrent updates na stejnou consumption | Poslední zápis vyhraje (Supabase upsert) – dokumentovat jako known limitation |
| `getInventoryStatus` s total=0 | Vrátit `gray` / `Vyprodáno` (aktuálně dělení nulou → NaN) |

## Acceptance Criteria
1. `npm run build:check` (tsc + vite build) projde bez chyb
2. Žádné `any` typy v kódu (ověřit grep: `rg ': any' src/ --type ts --type tsx`)
3. Žádný soubor v `src/` delší než 400 řádků
4. `npm test` projde – všechny unit testy pro calculationService zelené
5. Aplikace funguje identicky jako před refaktoringem (manuální smoke test: vytvořit událost, přidat konzumaci, zkopírovat summary, uzavřít událost)
6. Supabase credentials nejsou v žádném souboru trackovaném gitem
7. `getInventoryStatus` coloring v EventDetail funguje správně (ověřit vizuálně)

## Out of Scope
- Změny Supabase database schema
- Přidání autentizace/autorizace
- Migrace na novější verze knihoven (React 19, router v7 atd.)
- E2E testy (Playwright/Cypress)
- Změny v CSS/designu (kromě bug fixů)
- Refaktoring `migrateToSupabase.ts` a `LocalStorageRepository.ts`
- Přidání nové funkcionality
- Internacionalizace (i18n)
