# Extrakce malých komponent – InventoryItemRow & SharedItemCheckbox

## Overview
Extrahovat opakující se UI bloky z EventDetail.tsx do samostatných komponent. Toto je příprava na větší dekompozici EventDetail.

## Goals
- Odstranit duplicitní kód pro položky menu a sdílené položky
- Vytvořit znovupoužitelné komponenty

## Requirements

### Functional Requirements

#### `src/components/event/InventoryItemRow.tsx` (~80 řádků)
- [ ] Vytvořit komponentu pro řádek s položkou menu v consumption formuláři
- Props:
  ```typescript
  interface InventoryItemRowProps {
    menuItem: MenuItem;
    quantity: number;
    onIncrement: () => void;
    onDecrement: () => void;
    inventoryInfo?: { remaining: number; total: number; status: ReturnType<typeof getInventoryStatus> };
    showInventory: boolean;
  }
  ```
- Obsahuje: název položky, cenu, quantity +/- tlačítka, inventory status badge (zbývá X/Y), overdraft warning
- Aktuálně se identický blok opakuje 4× v EventDetail.tsx (favorites expanded, regular expanded, favorites bottom, regular bottom)
- [ ] Nahradit všechny 4 výskyty v EventDetail.tsx touto komponentou

#### `src/components/event/SharedItemCheckbox.tsx` (~40 řádků)
- [ ] Vytvořit komponentu pro checkbox sdílené položky
- Props:
  ```typescript
  interface SharedItemCheckboxProps {
    menuItem: MenuItem;
    isChecked: boolean;
    onToggle: () => void;
    participantCount: number;
    sharePrice: number;
  }
  ```
- Obsahuje: checkbox, název, cenu, počet účastníků, podíl na osobu
- Aktuálně duplicitní 2× v EventDetail.tsx (expanded form + bottom form)
- [ ] Nahradit oba výskyty v EventDetail.tsx touto komponentou

## Technical Approach
1. Vytvořit `src/components/event/` adresář (pokud neexistuje)
2. Implementovat `InventoryItemRow.tsx` – extrahovat přesný JSX z EventDetail
3. Implementovat `SharedItemCheckbox.tsx` – extrahovat přesný JSX z EventDetail
4. Nahradit duplicitní bloky v EventDetail.tsx importy nových komponent
5. Ověřit vizuální shodu

## Constraints
- Vizuální výstup musí být 100% identický
- Nesmí se změnit logika výpočtů
- Komponenty musí mít `React.memo` pro výkon

## Acceptance Criteria
1. `npm run build:check` projde bez chyb
2. Vizuálně identické s původním kódem
3. EventDetail.tsx je kratší o ~200-300 řádků
4. Žádný duplicitní JSX pro menu item rows a shared item checkboxes

## Out of Scope
- Dekompozice celého EventDetail (to je krok 08)
- Změny stylů
