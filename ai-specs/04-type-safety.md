# Typová bezpečnost – Database Types & odstranění `any`

## Overview
Přidat Supabase database typy a odstranit všechny `any` typy z projektu. Toto je základ pro bezpečný další refaktoring.

## Goals
- Zero `any` v celém projektu
- Typovaný Supabase client

## Requirements

### Functional Requirements
- [ ] Vytvořit `src/types/database.ts` s typy pro všechny Supabase tabulky:
  - `members` (id, name, is_core, revolut_username, bank_account)
  - `menu_items` (id, name, price, category, is_shared, is_favorite)
  - `events` (id, date, name, payer_id, total_amount, tip, status)
  - `event_members` (event_id, member_id, paid_self)
  - `event_preset_items` (event_id, menu_item_id, quantity)
  - `member_consumptions` (id, event_id, member_id, has_paid, total_amount)
  - `consumption_items` (consumption_id, menu_item_id, quantity)
  - `consumption_shared_items` (consumption_id, menu_item_id)
- [ ] Typovat `createClient` v `src/lib/supabase.ts`: `createClient<Database>(url, key)`
- [ ] Odstranit všechny `any` v `SupabaseRepository.ts` (~10 výskytů: `(em: any)`, `(pi: any)`, `(item: any)`, `(s: any)` v `mapRowToEvent` a `getEventConsumptions`)
- [ ] Opravit `useState<any>(null)` v `EventDetail.tsx` řádek 29 → `useState<Event | null>(null)`
- [ ] Opravit `as any` v `ManageMenu.tsx` řádky 127 a 245 (category select) → použít správný typ `MenuItem['category']`

### Non-Functional Requirements
- [ ] `npm run build:check` (tsc + vite build) projde bez chyb
- [ ] Žádné `any` v kódu (ověřit: `rg ': any' src/ --type ts --type tsx` a `rg 'as any' src/`)

## Technical Approach
1. Vytvořit `src/types/database.ts` podle Supabase schema konvence (typ `Database` s `public.Tables`)
2. Aktualizovat `src/lib/supabase.ts` – přidat generic typ
3. Projít `SupabaseRepository.ts` a nahradit `any` konkrétními typy z database.ts
4. Opravit zbylé `any` v komponentách

### Vzor pro database.ts:
```typescript
export interface Database {
  public: {
    Tables: {
      members: {
        Row: { id: string; name: string; is_core: boolean; revolut_username: string | null; bank_account: string | null; }
        Insert: { ... }
        Update: { ... }
      }
      // ... další tabulky
    }
  }
}
```

## Constraints
- Nesmí se změnit runtime chování – pouze typové anotace
- Supabase schema se nemění

## Acceptance Criteria
1. `npm run build:check` projde bez chyb
2. `rg 'any' src/ --type ts --type tsx` nevrátí žádné výsledky (kromě `catch (error: unknown)`)
3. Supabase client je typovaný s `Database` generics

## Out of Scope
- Změny Supabase schema
- Runtime validace dat (zod apod.)
