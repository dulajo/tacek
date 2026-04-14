// Core domain types based on specification

export interface Member {
  id: string;
  name: string;
  isCore: boolean; // true = pravidelný člen, false = náhradník
  revolutUsername?: string; // např. "pepa123" nebo "@pepa123"
  bankAccount?: string; // např. "123456789/0800"
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'food' | 'drink' | 'other';
  isShared: boolean; // pro položky typu vodní dýmka
  isFavorite?: boolean; // oblíbená položka (zobrazí se nahoře)
}

export interface EventItem {
  menuItemId: string;
  quantity: number;
}

export interface Event {
  id: string;
  date: Date;
  name?: string;
  payerId: string; // kdo zaplatil
  totalAmount: number;
  tip: number; // dýško
  presentMemberIds: string[];
  selfPaidMemberIds?: string[]; // IDs členů co platili si sami (bez dýška)
  presetItems?: EventItem[]; // produkty z účtenky (varianta A)
  status: 'open' | 'closed';
}

export interface MemberConsumption {
  eventId: string;
  memberId: string;
  items: EventItem[];
  sharedItemIds: string[]; // IDs položek ke kterým se člen přihlásil
  paidEntryFeeForIds: string[]; // IDs členů za které zaplatil startovné
  hasPaid: boolean;
  totalAmount: number; // cache vypočtené částky
}

// Calculated types for UI display
export interface MemberBalance {
  memberId: string;
  memberName: string;
  consumptionTotal: number;
  tipShare: number;
  entryFeeTotal: number;
  totalOwed: number;
  hasPaid: boolean;
  isPayer: boolean;
  paidSelf: boolean; // true = platil si sám (bez dýška)
}

export interface EventSummary {
  event: Event;
  totalConsumed: number;
  totalWithTip: number;
  difference: number; // rozdíl mezi totalAmount a totalConsumed
  allItemsAssigned: boolean;
  memberBalances: MemberBalance[];
}

// Draft type for auto-save functionality
export interface EventDraft {
  date: string;
  name: string;
  payerId: string;
  totalAmount: string;
  tip: string;
  selectedMemberIds: string[];
  selfPaidMemberIds: string[];
  hasReceipt: boolean;
  presetItems: EventItem[];
  savedAt: Date;
}
