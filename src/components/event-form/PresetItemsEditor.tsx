import { Link } from 'react-router-dom';
import { EventItem, MenuItem } from '../../types/models';

interface PresetItemsEditorProps {
  menuItems: MenuItem[];
  presetItems: EventItem[];
  hasReceipt: boolean;
  onHasReceiptChange: (value: boolean) => void;
  onAddItem: () => void;
  onUpdateItem: (index: number, field: 'menuItemId' | 'quantity', value: string | number) => void;
  onRemoveItem: (index: number) => void;
  presetItemsTotal: number;
}

export function PresetItemsEditor({
  menuItems,
  presetItems,
  hasReceipt,
  onHasReceiptChange,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  presetItemsTotal,
}: PresetItemsEditorProps) {
  return (
    <div className="card mb-6">
      <h2 className="text-lg font-semibold mb-4">Produkty z účtenky</h2>

      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasReceipt}
            onChange={(e) => onHasReceiptChange(e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">
            Mám účtenku s konkrétními produkty (varianta A)
          </span>
        </label>
      </div>

      {hasReceipt && (
        <>
          {menuItems.length === 0 ? (
            <p className="text-gray-500">
              Zatím nemáte žádné položky v jídelním lístku. <Link to="/menu" className="text-primary-600 underline">Přidejte položky</Link>
            </p>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {presetItems.map((item, index) => {
                  const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                  const itemTotal = menuItem ? menuItem.price * item.quantity : 0;

                  return (
                    <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                      <select
                        value={item.menuItemId}
                        onChange={(e) => onUpdateItem(index, 'menuItemId', e.target.value)}
                        className="input flex-1"
                      >
                        {menuItems.map(mi => (
                          <option key={mi.id} value={mi.id}>
                            {mi.name} ({mi.price} Kč)
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onUpdateItem(index, 'quantity', e.target.value)}
                        className="input w-20"
                      />

                      <span className="text-sm text-gray-600 w-24">
                        = {itemTotal.toFixed(2)} Kč
                      </span>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(index)}
                        className="btn btn-danger text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={onAddItem}
                className="btn btn-secondary w-full mb-4"
              >
                + Přidat položku
              </button>

              {presetItems.length > 0 && (
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Součet produktů:</span>
                    <span className="font-semibold">{presetItemsTotal.toFixed(2)} Kč</span>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
