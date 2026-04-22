import { MenuItem, EventItem, MemberConsumption } from '../types/models';
import { calculateItemsTotal } from '../services/calculationService';
import { MenuItemRow } from './MenuItemRow';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface OverdraftWarning {
  menuItemId: string;
  itemName: string;
  overdraft: number;
}

interface ConsumptionFormProps {
  memberId: string;
  presetItems: EventItem[] | undefined;
  consumptions: MemberConsumption[];
  menuItems: MenuItem[];
  editingItems: EventItem[];
  editingSharedIds: string[];
  favoriteItems: MenuItem[];
  regularItems: MenuItem[];
  sharedItems: MenuItem[];
  onItemQuantityChange: (menuItemId: string, delta: number) => void;
  onToggleSharedItem: (menuItemId: string) => void;
  onSave: () => void;
  onCancel: () => void;
  title?: string;
  overdraftWarnings?: OverdraftWarning[];
}

export function ConsumptionForm({
  memberId,
  presetItems,
  consumptions,
  menuItems,
  editingItems,
  editingSharedIds,
  favoriteItems,
  regularItems,
  sharedItems,
  onItemQuantityChange,
  onToggleSharedItem,
  onSave,
  onCancel,
  title,
  overdraftWarnings,
}: ConsumptionFormProps) {
  const total = calculateItemsTotal(editingItems, menuItems);

  return (
    <>
      {title && (
        <h4 className="font-medium text-gray-700 mb-3">
          {title}
        </h4>
      )}

      {/* OVERDRAFT WARNING BANNER */}
      {overdraftWarnings && overdraftWarnings.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Přečerpání inventáře</AlertTitle>
          <AlertDescription>
            <div className="text-sm text-amber-800">
              Rozdělili jste více položek než je na účtence:
            </div>
            <ul className="text-sm text-amber-800 mt-1 list-disc list-inside">
              {overdraftWarnings.map(o => (
                <li key={o.menuItemId}>
                  <strong>{o.itemName}</strong>: +{o.overdraft} navíc
                </li>
              ))}
            </ul>
            <div className="text-xs text-amber-700 mt-2">
              💡 Tip: Upravte účtenku nebo přesuňte položky od jiného člena
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Regular Items */}
      <div className="mb-4">
        {title ? (
          <h5 className="text-sm font-medium text-gray-700 mb-2">Běžné položky:</h5>
        ) : (
          <h3 className="font-medium text-gray-700 mb-2">Položky</h3>
        )}
        <div className="space-y-2">
          {favoriteItems.length > 0 && (
            <>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-2 mb-1">
                ⭐ Oblíbené
              </div>
              {favoriteItems.map(menuItem => (
                <MenuItemRow
                  key={menuItem.id}
                  menuItem={menuItem}
                  quantity={editingItems.find(i => i.menuItemId === menuItem.id)?.quantity || 0}
                  isFavorite={true}
                  presetItems={presetItems}
                  memberId={memberId}
                  consumptions={consumptions}
                  onQuantityChange={onItemQuantityChange}
                />
              ))}
            </>
          )}

          {regularItems.length > 0 && (
            <>
              {favoriteItems.length > 0 && (
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-4 mb-1">
                  Ostatní
                </div>
              )}
              {regularItems.map(menuItem => (
                <MenuItemRow
                  key={menuItem.id}
                  menuItem={menuItem}
                  quantity={editingItems.find(i => i.menuItemId === menuItem.id)?.quantity || 0}
                  isFavorite={false}
                  presetItems={presetItems}
                  memberId={memberId}
                  consumptions={consumptions}
                  onQuantityChange={onItemQuantityChange}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Shared Items */}
      {sharedItems.length > 0 && (
        <div className="mb-4">
          {title ? (
            <h5 className="text-sm font-medium text-gray-700 mb-2">Sdílené položky:</h5>
          ) : (
            <h3 className="font-medium text-gray-700 mb-2">Sdílené položky</h3>
          )}
          <div className="space-y-2">
            {sharedItems.map(menuItem => {
              const isChecked = editingSharedIds.includes(menuItem.id);
              const participantCount = consumptions.filter(c =>
                c.sharedItemIds.includes(menuItem.id)
              ).length + (isChecked ? 1 : 0) - (editingSharedIds.includes(menuItem.id) && consumptions.find(c => c.memberId === memberId)?.sharedItemIds.includes(menuItem.id) ? 1 : 0);
              const sharePrice = participantCount > 0 ? menuItem.price / participantCount : menuItem.price;

              return (
                <label
                  key={menuItem.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                    isChecked ? 'bg-purple-50 border-2 border-purple-300' : 'bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleSharedItem(menuItem.id)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{menuItem.name}</div>
                    <div className="text-sm text-gray-600">
                      {menuItem.price.toFixed(2)} Kč / {participantCount} = {sharePrice.toFixed(2)} Kč
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="bg-primary-50 p-3 rounded-lg mb-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Celkem:</span>
          <span>{total.toFixed(2)} Kč</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={onSave} variant="default" className="flex-1">
          <CheckCircle className="h-4 w-4" />
          Uložit
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          <XCircle className="h-4 w-4" />
          Zrušit
        </Button>
      </div>
    </>
  );
}
