import { useState, useMemo } from 'react';
import { EventItem, MenuItem } from '../types/models';

export interface EventFormData {
  date: string;
  name: string;
  payerId: string;
  totalAmount: string;
  tip: string;
}

interface UseEventFormParams {
  initialSelectedMemberIds: string[];
  initialSelfPaidMemberIds: string[];
  initialHasReceipt: boolean;
  initialPresetItems: EventItem[];
  initialEventData: EventFormData;
  menuItems: MenuItem[];
}

export function useEventForm({
  initialSelectedMemberIds,
  initialSelfPaidMemberIds,
  initialHasReceipt,
  initialPresetItems,
  initialEventData,
  menuItems,
}: UseEventFormParams) {
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(initialSelectedMemberIds);
  const [selfPaidMemberIds, setSelfPaidMemberIds] = useState<string[]>(initialSelfPaidMemberIds);
  const [hasReceipt, setHasReceipt] = useState(initialHasReceipt);
  const [presetItems, setPresetItems] = useState<EventItem[]>(initialPresetItems);
  const [eventData, setEventData] = useState<EventFormData>(initialEventData);

  const handleMemberToggle = (memberId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
    if (selectedMemberIds.includes(memberId)) {
      setSelfPaidMemberIds(prev => prev.filter(id => id !== memberId));
    }
  };

  const handleSelfPaidToggle = (memberId: string) => {
    setSelfPaidMemberIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddPresetItem = () => {
    if (menuItems.length === 0) return;
    setPresetItems(prev => [
      ...prev,
      { menuItemId: menuItems[0].id, quantity: 1 },
    ]);
  };

  const handleUpdatePresetItem = (index: number, field: 'menuItemId' | 'quantity', value: string | number) => {
    setPresetItems(prev => {
      const updated = [...prev];
      if (field === 'menuItemId') {
        updated[index].menuItemId = value as string;
      } else {
        updated[index].quantity = parseInt(value as string) || 0;
      }
      return updated;
    });
  };

  const handleRemovePresetItem = (index: number) => {
    setPresetItems(prev => prev.filter((_, i) => i !== index));
  };

  const presetItemsTotal = useMemo(() =>
    presetItems.reduce((total, item) => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      return total + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0),
    [presetItems, menuItems]
  );

  return {
    eventData,
    setEventData,
    selectedMemberIds,
    setSelectedMemberIds,
    selfPaidMemberIds,
    setSelfPaidMemberIds,
    hasReceipt,
    setHasReceipt,
    presetItems,
    setPresetItems,
    handleMemberToggle,
    handleSelfPaidToggle,
    handleAddPresetItem,
    handleUpdatePresetItem,
    handleRemovePresetItem,
    presetItemsTotal,
  };
}
