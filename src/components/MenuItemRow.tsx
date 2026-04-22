import { MenuItem, EventItem, MemberConsumption } from '../types/models';
import { getRemainingQuantity, getInventoryStatus } from '../services/calculationService';
import { Button } from './ui/button';

interface MenuItemRowProps {
  menuItem: MenuItem;
  quantity: number;
  isFavorite: boolean;
  presetItems: EventItem[] | undefined;
  memberId: string;
  consumptions: MemberConsumption[];
  onQuantityChange: (menuItemId: string, delta: number) => void;
}

export function MenuItemRow({
  menuItem,
  quantity,
  isFavorite,
  presetItems,
  memberId,
  consumptions,
  onQuantityChange,
}: MenuItemRowProps) {
  const total = menuItem.price * quantity;

  let remaining: number | null = null;
  let remainingAfterEdit: number | null = null;
  let inventoryColor: string | null = null;
  let isOnReceipt = false;

  if (presetItems) {
    const otherConsumptions = consumptions.filter(c => c.memberId !== memberId);
    remaining = getRemainingQuantity(menuItem.id, presetItems, otherConsumptions);
    remainingAfterEdit = remaining - quantity;
    const presetItem = presetItems.find(pi => pi.menuItemId === menuItem.id);
    const presetTotal = presetItem?.quantity || 0;
    inventoryColor = getInventoryStatus(remaining, presetTotal).color;
    isOnReceipt = !!presetItem;
  }

  if (!isOnReceipt && quantity === 0 && remaining !== null && remaining <= 0) return null;

  return (
    <div className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 p-2 rounded ${
      isFavorite ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
    }`}>
      <div>
        <div className="font-medium text-gray-900">{menuItem.name}</div>
        <div className="text-sm text-gray-600">
          {menuItem.price.toFixed(2)} Kč
          {presetItems && remainingAfterEdit !== null && (
            <span className={`ml-2 ${
              remainingAfterEdit < 0 ? 'text-red-600 font-semibold' :
              inventoryColor === 'green' ? 'text-green-600' :
              inventoryColor === 'yellow' ? 'text-yellow-600' :
              inventoryColor === 'red' ? 'text-red-600' :
              'text-gray-400'
            }`}>
              {remainingAfterEdit < 0
                ? `(přečerpání: ${Math.abs(remainingAfterEdit)})`
                : `(zbývá ${remainingAfterEdit}/${presetItems.find(pi => pi.menuItemId === menuItem.id)?.quantity || 0})`
              }
            </span>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600 min-w-[100px] text-right">
        {quantity > 0 && (
          <span className="font-medium">
            {quantity}× = {total.toFixed(2)} Kč
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          onClick={() => onQuantityChange(menuItem.id, -1)}
          variant="outline"
          size="icon"
          disabled={quantity === 0}
        >
          -
        </Button>
        <span className="w-8 text-center font-semibold">{quantity}</span>
        <Button
          onClick={() => onQuantityChange(menuItem.id, 1)}
          variant="default"
          size="icon"
          disabled={presetItems != null && remaining !== null && remaining <= 0 && quantity === 0 && !isOnReceipt}
        >
          +
        </Button>
      </div>
    </div>
  );
}
