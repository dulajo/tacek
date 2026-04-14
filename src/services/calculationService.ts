import { Event, MemberConsumption, MenuItem, EventItem, MemberBalance, EventSummary } from '../types/models';

/**
 * Business logic pro výpočty částek a rozdělení nákladů
 */

/**
 * Vypočte celkovou cenu položek na základě jídelního lístku
 */
export function calculateItemsTotal(items: EventItem[], menuItems: MenuItem[]): number {
  return items.reduce((total, item) => {
    const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
    if (!menuItem) return total;
    return total + (menuItem.price * item.quantity);
  }, 0);
}

/**
 * Vypočte podíl dýška na jednoho člena
 */
export function calculateTipPerMember(tip: number, memberCount: number): number {
  if (memberCount === 0) return 0;
  return Math.round((tip / memberCount) * 100) / 100;
}

/**
 * Vypočte celkovou částku za sdílené položky pro člena
 * Sdílená položka se rozdělí rovnoměrně mezi všechny přihlášené členy
 */
export function calculateSharedItemsTotal(
  sharedItemIds: string[],
  allConsumptions: MemberConsumption[],
  menuItems: MenuItem[]
): number {
  return sharedItemIds.reduce((total, sharedItemId) => {
    const menuItem = menuItems.find(mi => mi.id === sharedItemId);
    if (!menuItem || !menuItem.isShared) return total;

    // Počet členů kteří se přihlásili k této sdílené položce
    const participantCount = allConsumptions.filter(
      c => c.sharedItemIds.includes(sharedItemId)
    ).length;

    if (participantCount === 0) return total;

    return total + (menuItem.price / participantCount);
  }, 0);
}

/**
 * Vypočte celkovou částku za startovné zaplacené za ostatní
 */
export function calculateEntryFeeTotal(
  paidEntryFeeForIds: string[],
  menuItems: MenuItem[]
): number {
  const entryFeeItem = menuItems.find(mi => mi.name.toLowerCase().includes('startovné'));
  if (!entryFeeItem) return 0;
  
  return paidEntryFeeForIds.length * entryFeeItem.price;
}

/**
 * Vypočte bilanci pro jednoho člena
 */
export function calculateMemberBalance(
  memberId: string,
  memberName: string,
  consumption: MemberConsumption,
  event: Event,
  allConsumptions: MemberConsumption[],
  menuItems: MenuItem[]
): MemberBalance {
  const isPayer = event.payerId === memberId;
  const paidSelf = event.selfPaidMemberIds?.includes(memberId) || false;
  
  // Pokud člen platil si sám, má vše 0
  if (paidSelf) {
    return {
      memberId,
      memberName,
      consumptionTotal: 0,
      tipShare: 0,
      entryFeeTotal: 0,
      totalOwed: 0,
      hasPaid: true, // Self-paid members are automatically "paid"
      isPayer: false,
      paidSelf: true,
    };
  }
  
  // Vlastní konzumace
  const consumptionTotal = calculateItemsTotal(consumption.items, menuItems);
  
  // Sdílené položky
  const sharedTotal = calculateSharedItemsTotal(
    consumption.sharedItemIds,
    allConsumptions,
    menuItems
  );
  
  // Startovné za ostatní
  const entryFeeTotal = calculateEntryFeeTotal(
    consumption.paidEntryFeeForIds,
    menuItems
  );
  
  // Podíl na dýšku - počítáme jen mezi členy co NEplatili sami
  const selfPaidCount = event.selfPaidMemberIds?.length || 0;
  const tipPayingMemberCount = event.presentMemberIds.length - selfPaidCount;
  const tipShare = calculateTipPerMember(event.tip, tipPayingMemberCount);
  
  // Celková dlužná částka (konzumace + sdílené + startovné + dýško)
  const totalOwed = consumptionTotal + sharedTotal + entryFeeTotal + tipShare;

  return {
    memberId,
    memberName,
    consumptionTotal: consumptionTotal + sharedTotal,
    tipShare,
    entryFeeTotal,
    totalOwed: isPayer ? 0 : totalOwed, // Platič má dluh 0
    hasPaid: consumption.hasPaid,
    isPayer,
    paidSelf: false,
  };
}

/**
 * Vypočte kompletní přehled události
 */
export function calculateEventSummary(
  event: Event,
  consumptions: MemberConsumption[],
  menuItems: MenuItem[],
  members: { id: string; name: string }[]
): EventSummary {
  // Celková konzumace všech členů
  const totalConsumed = consumptions.reduce((total, consumption) => {
    const itemsTotal = calculateItemsTotal(consumption.items, menuItems);
    const sharedTotal = calculateSharedItemsTotal(
      consumption.sharedItemIds,
      consumptions,
      menuItems
    );
    const entryFeeTotal = calculateEntryFeeTotal(
      consumption.paidEntryFeeForIds,
      menuItems
    );
    return total + itemsTotal + sharedTotal + entryFeeTotal;
  }, 0);

  // Celková částka včetně dýška
  const totalWithTip = totalConsumed + event.tip;
  
  // Rozdíl oproti účtu
  const difference = event.totalAmount - totalWithTip;
  
  // Kontrola zda jsou všechny položky z účtenky rozebrané (varianta A)
  let allItemsAssigned = true;
  if (event.presetItems) {
    const presetTotal = calculateItemsTotal(event.presetItems, menuItems);
    allItemsAssigned = Math.abs(totalConsumed - presetTotal) < 0.01; // tolerance 1 haléř
  }
  
  // Bilance pro každého člena
  const memberBalances = consumptions.map(consumption => {
    const member = members.find(m => m.id === consumption.memberId);
    return calculateMemberBalance(
      consumption.memberId,
      member?.name || 'Neznámý',
      consumption,
      event,
      consumptions,
      menuItems
    );
  });

  return {
    event,
    totalConsumed,
    totalWithTip,
    difference,
    allItemsAssigned,
    memberBalances,
  };
}

/**
 * Validuje zda je událost kompletně vyřešená
 */
export function validateEventComplete(summary: EventSummary): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Kontrola rozdílu
  if (Math.abs(summary.difference) > 0.01) {
    if (summary.difference > 0) {
      warnings.push(`Chybí rozebrání ${summary.difference.toFixed(2)} Kč`);
    } else {
      warnings.push(`Překročeno o ${Math.abs(summary.difference).toFixed(2)} Kč`);
    }
  }
  
  // Kontrola produktů z účtenky
  if (summary.event.presetItems && !summary.allItemsAssigned) {
    warnings.push('Rozebrané produkty neodpovídají účtence');
  }
  
  // Kontrola nerozebraných sdílených položek
  const menuItems: string[] = []; // TODO: pass menuItems to check for shared items
  
  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

/**
 * Vypočte zbývající množství položky (inventory tracking pro Variantu A)
 */
export function getRemainingQuantity(
  menuItemId: string,
  presetItems: EventItem[],
  consumptions: MemberConsumption[]
): number {
  const preset = presetItems.find(i => i.menuItemId === menuItemId)?.quantity || 0;
  const consumed = consumptions.reduce((sum, c) => {
    const item = c.items.find(i => i.menuItemId === menuItemId);
    return sum + (item?.quantity || 0);
  }, 0);
  return preset - consumed;
}

/**
 * Vrátí barevné kódování pro inventory status
 */
export function getInventoryStatus(remaining: number, total: number): {
  color: 'green' | 'yellow' | 'red' | 'gray';
  label: string;
} {
  if (remaining === 0) {
    return { color: 'gray', label: 'Vyprodáno' };
  }
  
  const percentage = (remaining / total) * 100;
  
  if (percentage > 50) {
    return { color: 'green', label: 'Dostupné' };
  } else if (percentage >= 20) {
    return { color: 'yellow', label: 'Dochází' };
  } else {
    return { color: 'red', label: 'Málo' };
  }
}
