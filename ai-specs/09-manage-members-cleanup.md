# ManageMembers cleanup – extrakce MemberListItem

## Overview
ManageMembers.tsx má identický blok pro zobrazení/editaci člena duplikovaný 2× (core members řádky 156-231, substitute members řádky 242-318). Extrahovat do sdílené komponenty.

## Goals
- Odstranit duplicitu v ManageMembers.tsx
- ManageMembers.tsx max ~120 řádků

## Requirements

### Functional Requirements

#### `src/components/members/MemberListItem.tsx` (~100 řádků)
- [ ] Komponenta pro zobrazení jednoho člena s edit/delete funkcionalitou
- Props:
  ```typescript
  interface MemberListItemProps {
    member: Member;
    isEditing: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    editState: {
      name: string;
      isCore: boolean;
      revolutUsername: string;
      bankAccount: string;
      setName: (v: string) => void;
      setIsCore: (v: boolean) => void;
      setRevolutUsername: (v: string) => void;
      setBankAccount: (v: string) => void;
    };
    bgColorClass: string; // 'bg-primary-50' pro core, 'bg-gray-50' pro substitute
  }
  ```
- Obsahuje: view mode (jméno, revolut, účet, edit/delete tlačítka) a edit mode (inputy pro všechna pole, save/cancel)

#### Refaktor ManageMembers.tsx
- [ ] Nahradit oba duplicitní bloky (core + substitute) jedním `MemberListItem` mapováním
- [ ] Předat `bgColorClass` podle typu člena

## Technical Approach
1. Vytvořit `src/components/members/MemberListItem.tsx`
2. Nahradit duplicitní bloky v ManageMembers.tsx
3. Ověřit vizuální shodu

## Constraints
- Vizuální výstup musí být 100% identický
- Edit state management zůstává v ManageMembers (sdílený pro oba seznamy)

## Acceptance Criteria
1. `npm run build:check` projde bez chyb
2. ManageMembers.tsx max 150 řádků
3. Vizuálně identické
4. Manuální smoke test: přidat člena, editovat, smazat

## Out of Scope
- Změny v ManageMenu.tsx
- Nová funkcionalita
