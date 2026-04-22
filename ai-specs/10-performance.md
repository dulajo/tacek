# Výkonnostní optimalizace

## Overview
Přidat lazy loading pro stránky, stabilizovat callback reference v AppContext a přidat memoizaci odvozených dat.

## Goals
- Menší initial bundle (code splitting)
- Stabilní reference (méně zbytečných renderů)

## Requirements

### Functional Requirements

#### Lazy loading stránek
- [ ] V `App.tsx`: nahradit přímé importy stránek za `React.lazy()`
- [ ] Přidat `<Suspense fallback={<LoadingBar />}>` kolem `<Routes>`
- Stránky k lazy loadingu: Dashboard, EventDetail, CreateEvent, EditEvent, ManageMembers, ManageMenu

#### Stabilní reference v AppContext
- [ ] Zabalit `refreshMembers`, `refreshMenuItems`, `refreshEvents` do `useCallback`
- [ ] Zabalit `refreshAll` do `useCallback` s deps na refresh funkce
- [ ] Memoizovat `value` objekt pomocí `useMemo`

#### Memoizace v Dashboard
- [ ] `coreMembers` a `substituteMembers` zabalit do `useMemo`
- [ ] `getUnpaidMembers` je už `useCallback` – ověřit deps

#### Memoizace v ManageMenu
- [ ] `foodItems`, `drinkItems`, `otherItems` zabalit do `useMemo`

## Technical Approach
1. App.tsx: `const Dashboard = React.lazy(() => import('./pages/Dashboard'))` atd.
2. AppContext: `useCallback` + `useMemo`
3. Dashboard/ManageMenu: `useMemo` pro filtrované seznamy

## Constraints
- Nesmí se změnit chování aplikace
- LoadingBar se zobrazí při lazy loading stránek

## Acceptance Criteria
1. `npm run build:check` projde bez chyb
2. Lazy loading funguje – při navigaci se zobrazí LoadingBar
3. React DevTools: AppContext value reference se nemění při re-renderu (pokud se data nezměnila)

## Out of Scope
- React.memo na všechny komponenty (overkill pro tuto velikost)
- Virtualizace seznamů
