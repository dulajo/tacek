# Opravy bugů

## Overview
Opravit identifikované bugy v kódu – chybějící error handling, state mutace, stale closures a race conditions.

## Goals
- Opravit všechny identifikované bugy bez změny funkcionality

## Requirements

### Functional Requirements

#### Bug 1: Chybějící error handling v `updateEvent` (SupabaseRepository.ts)
- [ ] Řádky ~284-300 a ~302-319: delete/insert `event_members` a `event_preset_items` ignorují chyby
- **Oprava:** Přidat `if (error) throw error` po každém delete/insert volání

#### Bug 2: Stale closure v AppContext.tsx
- [ ] `refreshMembers`, `refreshMenuItems`, `refreshEvents` se vytvářejí při každém renderu
- **Oprava:** Zabalit do `useCallback` s prázdným dependency array (repository je stabilní ref)
- [ ] `refreshAll` závisí na refresh funkcích – také zabalit do `useCallback`

#### Bug 3: `useEffect` dependencies v CreateEvent.tsx
- [ ] Řádek ~55-59: `useEffect` pro draft dialog nemá `hasDraft` a `draft` v deps
- **Oprava:** Přidat `// eslint-disable-next-line react-hooks/exhaustive-deps` s komentářem proč (intentional mount-only), NEBO přidat deps
- [ ] Řádek ~62-84: auto-save `useEffect` má `saveDraft` v closure ale ne v deps
- **Oprava:** Přidat `saveDraft` do deps nebo použít ref

#### Bug 4: `getInventoryStatus` dělení nulou
- [ ] V `calculationService.ts`: pokud `total === 0`, výpočet `(remaining / total) * 100` vrátí `Infinity`
- **Oprava:** Přidat guard: `if (total === 0) return { color: 'gray', label: 'Vyprodáno' }`

#### Bug 5: Race condition v `handleTogglePaid` (EventDetail.tsx)
- [ ] Mezi `repository.updateConsumption` a `repository.getEventConsumptions` může dojít k race condition
- **Oprava:** Použít optimistic update – aktualizovat lokální state okamžitě, pak synchronizovat s DB

## Technical Approach
- Každý bug fix je izolovaný – opravit jeden po druhém
- Po každé opravě ověřit `npm run build:check`

## Constraints
- Nesmí se změnit vizuální vzhled
- Nesmí se změnit API/chování (kromě oprav bugů)

## Acceptance Criteria
1. `npm run build:check` projde bez chyb
2. Všechny Supabase operace v `updateEvent` mají error handling
3. AppContext refresh funkce jsou stabilní reference (useCallback)
4. `getInventoryStatus(0, 0)` nevrátí NaN/Infinity

## Out of Scope
- Nové funkce
- Refaktoring komponent (to je v dalších krocích)
