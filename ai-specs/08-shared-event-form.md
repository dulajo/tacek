# Sdílený EventForm pro Create/Edit

## Overview
CreateEvent.tsx a EditEvent.tsx sdílejí ~80% formulářového kódu (základní údaje, výběr členů, platba, preset items). Sloučit do jedné sdílené komponenty.

## Goals
- Odstranit duplicitu mezi CreateEvent a EditEvent
- CreateEvent.tsx max ~80 řádků (draft management + wrapper)
- EditEvent.tsx max ~100 řádků (loading + warning + wrapper)

## Requirements

### Functional Requirements

#### `src/components/event/EventForm.tsx` (~250 řádků)
- [ ] Sdílený formulář pro vytvoření i editaci události
- Props:
  ```typescript
  interface EventFormProps {
    initialData?: {
      date: string;
      name: string;
      payerId: string;
      totalAmount: string;
      tip: string;
      selectedMemberIds: string[];
      selfPaidMemberIds: string[];
      hasReceipt: boolean;
      presetItems: EventItem[];
    };
    onSubmit: (data: EventFormSubmitData) => Promise<void>;
    submitLabel: string;
    members: Member[];
    menuItems: MenuItem[];
    onDateChange?: (date: string) => string; // optional callback pro auto-generování názvu
  }
  ```
- Obsahuje: základní údaje (datum, název), MemberSelector, PayerSection, PresetItemsEditor, submit button
- Interně používá `useEventForm` hook

#### Refaktor CreateEvent.tsx (~80 řádků)
- [ ] Pouze: draft management (useEventDraft), draft dialog, header, EventForm wrapper
- [ ] `onSubmit` callback: vytvoří Event objekt, zavolá `repository.createEvent`, clearDraft, navigate
- [ ] `onDateChange`: vrátí `generateEventName(date)`

#### Refaktor EditEvent.tsx (~100 řádků)
- [ ] Pouze: loading state, event fetch, warning dialog pro closed events, header, EventForm wrapper
- [ ] `onSubmit` callback: aktualizuje event, smaže removed member consumptions, přepočítá balances, navigate
- [ ] `initialData` se naplní z načteného eventu

## Technical Approach
1. Vytvořit `EventForm.tsx` – extrahovat společný formulář z CreateEvent
2. Refaktorovat CreateEvent.tsx – nahradit inline form za EventForm
3. Refaktorovat EditEvent.tsx – nahradit inline form za EventForm
4. Ověřit že oba flows fungují identicky

## Constraints
- Draft auto-save v CreateEvent musí fungovat jako dříve
- Warning dialog pro closed events v EditEvent musí fungovat jako dříve
- Existující komponenty MemberSelector, PayerSection, PresetItemsEditor se nemění

## Acceptance Criteria
1. `npm run build:check` projde bez chyb
2. CreateEvent.tsx max 100 řádků
3. EditEvent.tsx max 120 řádků
4. Manuální smoke test: vytvořit novou událost, editovat existující událost
5. Draft auto-save funguje v CreateEvent
6. Warning dialog funguje v EditEvent pro closed events

## Out of Scope
- Změny v MemberSelector, PayerSection, PresetItemsEditor
- Změny v useEventForm hook
- Nová funkcionalita
