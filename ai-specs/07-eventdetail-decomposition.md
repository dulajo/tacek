# Dekompozice EventDetail.tsx

## Overview
Rozdělit masivní EventDetail.tsx (~1525 řádků) na menší komponenty. Po kroku 06 (InventoryItemRow, SharedItemCheckbox) zbývá extrahovat ConsumptionForm, MemberBalanceCard a EventSummaryHeader.

## Goals
- EventDetail.tsx max ~300 řádků (state management + kompozice)
- Žádný soubor delší než 400 řádků

## Requirements

### Functional Requirements

#### `src/components/event/ConsumptionForm.tsx` (~150 řádků)
- [ ] Formulář pro přidání/editaci konzumace člena
- Props:
  ```typescript
  interface ConsumptionFormProps {
    menuItems: MenuItem[];
    sharedItems: MenuItem[];
    editingItems: EventItem[];
    editingSharedIds: string[];
    onItemQuantityChange: (menuItemId: string, delta: number) => void;
    onToggleSharedItem: (menuItemId: string) => void;
    onSave: () => void;
    onCancel: () => void;
    event: Event;
    consumptions: MemberConsumption[];
    editingTotal: number;
  }
  ```
- Obsahuje: sekci favorites, sekci regular items, sekci shared items (vše s InventoryItemRow/SharedItemCheckbox z kroku 06), celkový součet, Save/Cancel tlačítka
- Aktuálně duplicitní v expanded member card a bottom form v EventDetail.tsx

#### `src/components/event/MemberBalanceCard.tsx` (~120 řádků)
- [ ] Karta s bilancí jednoho člena
- Props:
  ```typescript
  interface MemberBalanceCardProps {
    balance: MemberBalance;
    consumption: MemberConsumption | undefined;
    menuItems: MenuItem[];
    consumptions: MemberConsumption[];
    event: Event;
    isExpanded: boolean;
    onToggleExpansion: () => void;
    onTogglePaid: () => void;
    onSaveConsumption: () => void;
    editingItems: EventItem[];
    editingSharedIds: string[];
    onItemQuantityChange: (menuItemId: string, delta: number) => void;
    onToggleSharedItem: (menuItemId: string) => void;
  }
  ```
- Obsahuje: jméno, částku, status zaplacení, seznam položek, tlačítko pro rozbalení, rozbalený ConsumptionForm

#### `src/components/event/EventSummaryHeader.tsx` (~80 řádků)
- [ ] Horní summary karta s info o platiči a tlačítkem pro kopírování
- Props:
  ```typescript
  interface EventSummaryHeaderProps {
    event: Event;
    payer: Member | undefined;
    onCopySummary: () => void;
  }
  ```

#### Refaktor EventDetail.tsx
- [ ] Výsledný EventDetail.tsx obsahuje pouze:
  - State management (useState, useEffect, useMemo, useCallback)
  - Data loading (loadEventData)
  - Event handlers (handleTogglePaid, handleCopySummary, handleToggleEventStatus, handleDeleteEvent)
  - Kompozice komponent (EventSummaryHeader, validation card, MemberBalanceCard list, bottom ConsumptionForm, dialogy)
- [ ] Max ~300 řádků

## Technical Approach
1. Extrahovat EventSummaryHeader (nejjednodušší, žádné závislosti)
2. Extrahovat ConsumptionForm (sloučit expanded + bottom form do jedné komponenty)
3. Extrahovat MemberBalanceCard (závisí na ConsumptionForm)
4. Refaktorovat EventDetail.tsx – nahradit inline JSX importy komponent
5. Ověřit vizuální shodu

## Constraints
- Vizuální výstup musí být 100% identický
- `handleCopySummary` logika zůstává v EventDetail (generuje text z celého stavu)
- Dialogy (auto-close, close-with-unpaid, delete confirm) zůstávají v EventDetail

## Acceptance Criteria
1. `npm run build:check` projde bez chyb
2. EventDetail.tsx max 300 řádků
3. Žádný nový soubor delší než 400 řádků
4. Vizuálně identické s původním kódem
5. Manuální smoke test: otevřít událost, rozbalit člena, přidat položky, uložit, označit zaplaceno

## Out of Scope
- Změny business logiky
- Změny stylů
- Refaktoring Create/Edit (to je krok 09)
