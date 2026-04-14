import { IDataRepository } from './IDataRepository';
import { Member, MenuItem, Event, MemberConsumption } from '../types/models';

const STORAGE_KEYS = {
  MEMBERS: 'tacek_members',
  MENU_ITEMS: 'tacek_menu_items',
  EVENTS: 'tacek_events',
  CONSUMPTIONS: 'tacek_consumptions',
} as const;

/**
 * LocalStorage implementace repository
 * Data jsou ukládána jako JSON v localStorage
 */
export class LocalStorageRepository implements IDataRepository {
  // Helper methods
  private getFromStorage<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data, this.reviver) : [];
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Custom JSON reviver to handle Date objects
  private reviver(key: string, value: unknown): unknown {
    if (key === 'date' && typeof value === 'string') {
      return new Date(value);
    }
    return value;
  }

  // Members
  async getMembers(): Promise<Member[]> {
    return this.getFromStorage<Member>(STORAGE_KEYS.MEMBERS);
  }

  async addMember(member: Member): Promise<void> {
    const members = await this.getMembers();
    members.push(member);
    this.saveToStorage(STORAGE_KEYS.MEMBERS, members);
  }

  async updateMember(member: Member): Promise<void> {
    const members = await this.getMembers();
    const index = members.findIndex(m => m.id === member.id);
    if (index !== -1) {
      members[index] = member;
      this.saveToStorage(STORAGE_KEYS.MEMBERS, members);
    }
  }

  async deleteMember(id: string): Promise<void> {
    const members = await this.getMembers();
    const filtered = members.filter(m => m.id !== id);
    this.saveToStorage(STORAGE_KEYS.MEMBERS, filtered);
  }

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    return this.getFromStorage<MenuItem>(STORAGE_KEYS.MENU_ITEMS);
  }

  async addMenuItem(item: MenuItem): Promise<void> {
    const items = await this.getMenuItems();
    items.push(item);
    this.saveToStorage(STORAGE_KEYS.MENU_ITEMS, items);
  }

  async updateMenuItem(item: MenuItem): Promise<void> {
    const items = await this.getMenuItems();
    const index = items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      items[index] = item;
      this.saveToStorage(STORAGE_KEYS.MENU_ITEMS, items);
    }
  }

  async deleteMenuItem(id: string): Promise<void> {
    const items = await this.getMenuItems();
    const filtered = items.filter(i => i.id !== id);
    this.saveToStorage(STORAGE_KEYS.MENU_ITEMS, filtered);
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return this.getFromStorage<Event>(STORAGE_KEYS.EVENTS);
  }

  async getEvent(id: string): Promise<Event | null> {
    const events = await this.getEvents();
    return events.find(e => e.id === id) || null;
  }

  async createEvent(event: Event): Promise<void> {
    const events = await this.getEvents();
    events.push(event);
    this.saveToStorage(STORAGE_KEYS.EVENTS, events);
  }

  async updateEvent(event: Event): Promise<void> {
    const events = await this.getEvents();
    const index = events.findIndex(e => e.id === event.id);
    if (index !== -1) {
      events[index] = event;
      this.saveToStorage(STORAGE_KEYS.EVENTS, events);
    }
  }

  async deleteEvent(id: string): Promise<void> {
    const events = await this.getEvents();
    const filtered = events.filter(e => e.id !== id);
    this.saveToStorage(STORAGE_KEYS.EVENTS, filtered);
    
    // Also delete all consumptions for this event
    const consumptions = await this.getEventConsumptions(id);
    for (const consumption of consumptions) {
      await this.deleteConsumption(id, consumption.memberId);
    }
  }

  // Consumptions
  async getEventConsumptions(eventId: string): Promise<MemberConsumption[]> {
    const allConsumptions = this.getFromStorage<MemberConsumption>(STORAGE_KEYS.CONSUMPTIONS);
    return allConsumptions.filter(c => c.eventId === eventId);
  }

  async updateConsumption(consumption: MemberConsumption): Promise<void> {
    const allConsumptions = this.getFromStorage<MemberConsumption>(STORAGE_KEYS.CONSUMPTIONS);
    const index = allConsumptions.findIndex(
      c => c.eventId === consumption.eventId && c.memberId === consumption.memberId
    );
    
    if (index !== -1) {
      allConsumptions[index] = consumption;
    } else {
      allConsumptions.push(consumption);
    }
    
    this.saveToStorage(STORAGE_KEYS.CONSUMPTIONS, allConsumptions);
  }

  async deleteConsumption(eventId: string, memberId: string): Promise<void> {
    const allConsumptions = this.getFromStorage<MemberConsumption>(STORAGE_KEYS.CONSUMPTIONS);
    const filtered = allConsumptions.filter(
      c => !(c.eventId === eventId && c.memberId === memberId)
    );
    this.saveToStorage(STORAGE_KEYS.CONSUMPTIONS, filtered);
  }

  // Bulk operations
  async clearAllData(): Promise<void> {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}
