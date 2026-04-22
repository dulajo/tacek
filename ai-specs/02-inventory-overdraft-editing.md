# Allow Inventory Overdraft During Consumption Editing

## Overview
Currently, when all items from a receipt are distributed among members (inventory = 0), users cannot easily reassign items between members. This spec implements **Varianta 1**: allowing temporary inventory overdraft during editing, with clear visual warnings but permitting the user to save.

This improves UX significantly for the common scenario where a user wants to "move" an item from one member to another without having to first edit the event receipt.

## Goals
- Allow users to temporarily exceed inventory limits when editing existing consumption
- Show clear visual warnings when inventory is exceeded (overdraft state)
- Permit saving even in overdraft state (user flexibility over strict enforcement)
- Maintain existing inventory tracking display and logic for non-overdraft scenarios

## Requirements

### Functional Requirements
- [ ] When editing consumption for a member, allow adding items even if `remaining === 0`
- [ ] Calculate and display overdraft amount: `overdraft = totalConsumed - totalOnReceipt`
- [ ] Show warning banner when overdraft > 0 for any item
- [ ] Allow save operation even when in overdraft state
- [ ] Continue to show inventory status `(zbývá X/Y)` for all items as before
- [ ] Disable the "+" button only when user has never edited this item before AND inventory is 0 (hide out-of-stock items from new selection)

### Non-Functional Requirements
- [ ] Warning should be visually clear but not alarming (use amber/yellow theme colors)
- [ ] Performance: overdraft calculation should not noticeably slow down the UI
- [ ] Maintain existing behavior for Variant B events (no presetItems, no inventory tracking)

## Technical Approach

### 1. Modify EventDetail.tsx - Disable Logic

**Current code** (lines 709):
```tsx
disabled={event.presetItems && remaining !== null && remaining <= 0}
```

**New logic**:
```tsx
disabled={false} // Never disable the + button when editing existing consumption
```

**OR more precisely** (recommended):
```tsx
// Only disable if this is a NEW item (not in editingItems) AND out of stock
disabled={event.presetItems && remaining !== null && remaining <= 0 && quantity === 0}
```

This allows:
- ✅ Adding more of an item the member already has (quantity > 0)
- ❌ Adding a completely new item when it's out of stock (quantity === 0)

### 2. Add Overdraft Calculation Function

Add to `src/services/calculationService.ts`:

```typescript
/**
 * Vypočte "přečerpání" (overdraft) pro danou položku
 * Vrátí kladné číslo pokud je rozděleno více než je na účtence
 */
export function calculateItemOverdraft(
  menuItemId: string,
  presetItems: EventItem[],
  consumptions: MemberConsumption[]
): number {
  const preset = presetItems.find(i => i.menuItemId === menuItemId)?.quantity || 0;
  const consumed = consumptions.reduce((sum, c) => {
    const item = c.items.find(i => i.menuItemId === menuItemId);
    return sum + (item?.quantity || 0);
  }, 0);
  
  const overdraft = consumed - preset;
  return overdraft > 0 ? overdraft : 0;
}

/**
 * Vypočte celkové přečerpání pro všechny položky v události
 * Vrátí objekt: { [menuItemId]: overdraftAmount }
 */
export function calculateAllOverdrafts(
  presetItems: EventItem[],
  consumptions: MemberConsumption[],
  menuItems: MenuItem[]
): { menuItemId: string; itemName: string; overdraft: number }[] {
  return presetItems
    .map(preset => {
      const overdraft = calculateItemOverdraft(preset.menuItemId, presetItems, consumptions);
      const menuItem = menuItems.find(mi => mi.id === preset.menuItemId);
      return {
        menuItemId: preset.menuItemId,
        itemName: menuItem?.name || 'Neznámá položka',
        overdraft,
      };
    })
    .filter(item => item.overdraft > 0);
}
```

### 3. Add Overdraft Warning Banner

In `EventDetail.tsx`, after the consumption form section (around line 630-635), add overdraft detection and warning:

```tsx
{isExpanded && !isSelfPaid && (
  <div className="border-t border-gray-300 bg-white p-4">
    <h4 className="font-medium text-gray-700 mb-3">
      {hasItems ? '✏️ Upravit konzumaci' : '➕ Přidat konzumaci'}
    </h4>
    
    {/* OVERDRAFT WARNING BANNER */}
    {event.presetItems && (() => {
      // Calculate current overdrafts including pending edits
      const tempConsumptions = consumptions.map(c => 
        c.memberId === balance.memberId 
          ? { ...c, items: editingItems }
          : c
      );
      const overdrafts = calculateAllOverdrafts(event.presetItems, tempConsumptions, menuItems);
      
      if (overdrafts.length > 0) {
        return (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-amber-600 text-xl">⚠️</span>
              <div className="flex-1">
                <div className="font-medium text-amber-900 mb-1">
                  Přečerpání inventáře
                </div>
                <div className="text-sm text-amber-800">
                  Rozdělili jste více položek než je na účtence:
                </div>
                <ul className="text-sm text-amber-800 mt-1 list-disc list-inside">
                  {overdrafts.map(o => (
                    <li key={o.menuItemId}>
                      <strong>{o.itemName}</strong>: +{o.overdraft} navíc
                    </li>
                  ))}
                </ul>
                <div className="text-xs text-amber-700 mt-2">
                  💡 Tip: Upravte účtenku nebo přesuňte položky od jiného člena
                </div>
              </div>
            </div>
          </div>
        );
      }
      return null;
    })()}
    
    {/* Rest of the form... */}
```

### 4. Update Inventory Status Display

Modify the inventory status display to show negative remaining as overdraft:

**Current** (around line 674-682):
```tsx
{event.presetItems && remaining !== null && (
  <span className={`ml-2 ${/* color based on status */}`}>
    (zbývá {remaining}/{total})
  </span>
)}
```

**New**:
```tsx
{event.presetItems && remaining !== null && (
  <span className={`ml-2 ${
    remaining < 0 ? 'text-amber-600 font-semibold' :
    inventoryStatus === 'high' ? 'text-green-600' :
    inventoryStatus === 'medium' ? 'text-yellow-600' :
    inventoryStatus === 'low' ? 'text-red-600' :
    'text-gray-400'
  }`}>
    {remaining < 0 
      ? `(přečerpání: ${Math.abs(remaining)})`
      : `(zbývá ${remaining}/${total})`
    }
  </span>
)}
```

### 5. Import Statement

Add import at top of `EventDetail.tsx`:

```typescript
import { calculateItemOverdraft, calculateAllOverdrafts } from '../services/calculationService';
```

## Constraints
- Must work correctly for both Variant A (with receipt) and Variant B (without receipt) events
- Overdraft calculation must include the currently-being-edited items (not just saved consumptions)
- Should not break existing inventory hiding logic (line 664: `if (isOutOfStock) return null`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User adds item when inventory = 0 but they already have quantity > 0 | ✅ Allowed, show overdraft warning |
| User tries to add brand new item when inventory = 0 | ❌ Button disabled (keep existing behavior) |
| User reduces quantity below 0 | ✅ Item removed from list (existing behavior, keep it) |
| Multiple items in overdraft state | Show all in warning banner as bullet list |
| User saves while in overdraft | ✅ Allowed to save, no blocking |
| Event without presetItems (Variant B) | No overdraft logic, no warnings shown |
| Overdraft becomes 0 after edit | Warning banner disappears automatically |

## UI/UX Specifications

### Warning Banner Styling
- **Background**: `bg-amber-50` (soft yellow, not alarming)
- **Border**: `border-amber-300` 
- **Text colors**: `text-amber-900` (title), `text-amber-800` (body), `text-amber-700` (tip)
- **Icon**: ⚠️ emoji (amber colored)
- **Position**: Immediately below form title, above item list
- **Behavior**: Only shown when overdrafts exist (reactive)

### Inventory Display
- **Normal states**: Keep existing green/yellow/red color coding
- **Overdraft state** (`remaining < 0`): 
  - Text: `(přečerpání: X)` where X is absolute value
  - Color: `text-amber-600 font-semibold`

### Button States
- **"+" button**: Disabled only for NEW items (quantity === 0) when inventory = 0
- **"-" button**: Keep existing behavior (disabled when quantity === 0)
- **"Uložit konzumaci"**: Always enabled, even in overdraft

## Acceptance Criteria

1. ✅ User can increase quantity of an existing item even when inventory shows 0 remaining
2. ✅ Warning banner appears when total consumed > total on receipt
3. ✅ Warning banner lists all items in overdraft with specific amounts
4. ✅ User can save consumption while in overdraft state
5. ✅ Inventory display shows `(přečerpání: X)` instead of `(zbývá -X/Y)` when negative
6. ✅ "+" button is still disabled for completely new items when inventory = 0
7. ✅ No warnings or errors for Variant B events (without presetItems)
8. ✅ Overdraft calculation includes currently-being-edited items (real-time update)

## Out of Scope
- Auto-fixing overdrafts (user must manually resolve)
- Preventing save operation (we explicitly allow it per Varianta 1)
- Email notifications about overdrafts
- Historical tracking of overdraft states
- Bulk reassignment UI ("move 3 beers from Lukáš to Petr")
