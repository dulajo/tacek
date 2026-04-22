# Unit testy pro calculationService

## Overview
Přidat Vitest a napsat unit testy pro veškerou business logiku v `calculationService.ts`.

## Goals
- 100% pokrytí calculationService
- Záchytná síť pro budoucí refaktoring

## Requirements

### Functional Requirements

#### Setup
- [ ] Přidat dev dependencies: `vitest`, `@vitest/coverage-v8`
- [ ] Přidat scripts do `package.json`: `"test": "vitest"`, `"test:coverage": "vitest --coverage"`
- [ ] Vytvořit `vitest.config.ts` (nebo přidat do `vite.config.ts`)

#### `src/services/calculationService.test.ts`
- [ ] `isConsumptionPaid`: hasPaid=true, selfPaid member, payer, regular unpaid
- [ ] `calculateItemsTotal`: prázdné pole, jeden item, více items, neexistující menuItem
- [ ] `calculateTipPerMember`: 0 členů (dělení nulou), 1 člen, více členů, zaokrouhlení
- [ ] `calculateSharedItemsTotal`: žádní účastníci, 1 účastník, více účastníků, non-shared item
- [ ] `calculateEntryFeeTotal`: žádné startovné v menu, startovné existuje, více členů
- [ ] `calculateMemberBalance`: platič (totalOwed=0), self-paid člen, běžný člen, člen se sdílenými položkami
- [ ] `calculateEventSummary`: kompletní scénář s více členy
- [ ] `getRemainingQuantity`: preset > consumed, preset = consumed, preset < consumed
- [ ] `calculateItemOverdraft`: žádné přečerpání, přečerpání
- [ ] `getInventoryStatus`: green, yellow, red, gray stavy + edge case total=0
- [ ] `validateEventComplete`: valid event, event s rozdílem, event s neodpovídající účtenkou
- [ ] `calculateAllOverdrafts`: žádné overdrafty, některé overdrafty

## Technical Approach
- Vitest s inline config nebo `vitest.config.ts`
- Test fixtures: vytvořit helper funkce pro generování testovacích dat (members, menuItems, events, consumptions)
- Každá funkce má vlastní `describe` blok

## Constraints
- Pouze unit testy pro pure funkce (žádné React komponenty, žádné API calls)
- Žádné mocky – calculationService je pure

## Acceptance Criteria
1. `npm test` projde – všechny testy zelené
2. `npm run test:coverage` – calculationService.ts má 100% line coverage
3. Testy pokrývají všechny edge cases (dělení nulou, prázdná pole, neexistující entity)

## Out of Scope
- Testy pro React komponenty
- E2E testy
- Testy pro repository vrstvu
