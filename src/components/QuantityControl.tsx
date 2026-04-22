import React from 'react';
import { Button } from './ui/button';
import { MenuItem } from '../types/models';

interface QuantityControlProps {
  menuItem: MenuItem;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
  inventoryInfo?: {
    remaining: number;
    total: number;
  } | null;
}

/**
 * Reusable quantity control component with +/- buttons
 * Used for managing item quantities in event consumption forms
 */
export const QuantityControl = React.memo<QuantityControlProps>(({
  menuItem,
  quantity,
  onIncrement,
  onDecrement,
  disabled = false,
  inventoryInfo = null,
}) => {
  const total = menuItem.price * quantity;
  
  // Calculate overdraft status
  const isOverdraft = inventoryInfo ? inventoryInfo.remaining < 0 : false;

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 bg-gray-50 p-2 rounded">
      {/* Left: Item info */}
      <div>
        <div className="font-medium text-gray-900">{menuItem.name}</div>
        <div className="text-sm text-gray-600">
          {menuItem.price.toFixed(2)} Kč
          {inventoryInfo && (
            <span className={`ml-2 ${
              isOverdraft 
                ? 'text-amber-600 font-semibold' 
                : inventoryInfo.remaining === 0 
                ? 'text-gray-400'
                : inventoryInfo.remaining / inventoryInfo.total > 0.5
                ? 'text-green-600'
                : inventoryInfo.remaining / inventoryInfo.total >= 0.2
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {isOverdraft 
                ? `(přečerpání: ${Math.abs(inventoryInfo.remaining)})`
                : `(zbývá ${inventoryInfo.remaining}/${inventoryInfo.total})`
              }
            </span>
          )}
        </div>
      </div>
      
      {/* Middle: Calculated total */}
      <div className="text-sm text-gray-600 min-w-[100px] text-right">
        {quantity > 0 && (
          <span className="font-medium">
            {quantity}× = {total.toFixed(2)} Kč
          </span>
        )}
      </div>
      
      {/* Right: Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          onClick={onDecrement}
          variant="outline"
          size="icon"
          disabled={quantity === 0}
        >
          -
        </Button>
        <span className="w-8 text-center font-semibold">{quantity}</span>
        <Button
          onClick={onIncrement}
          variant="default"
          size="icon"
          disabled={disabled}
        >
          +
        </Button>
      </div>
    </div>
  );
});

QuantityControl.displayName = 'QuantityControl';
