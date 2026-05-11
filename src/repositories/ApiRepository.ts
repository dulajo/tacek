import type { IDataRepository } from './IDataRepository';
import type { Member, MenuItem, Event, MemberConsumption } from '../types/models';

export class ApiRepository implements IDataRepository {
  private baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_URL || '/api') {
    this.baseUrl = baseUrl;
  }

  private async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async getMembers(): Promise<Member[]> {
    return this.fetchJson<Member[]>(`${this.baseUrl}/members`);
  }

  async addMember(member: Member): Promise<void> {
    await fetch(`${this.baseUrl}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`); });
  }

  async updateMember(member: Member): Promise<void> {
    await fetch(`${this.baseUrl}/members/${member.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`); });
  }

  async deleteMember(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/members/${id}`, { method: 'DELETE' })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`); });
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return this.fetchJson<MenuItem[]>(`${this.baseUrl}/menu-items`);
  }

  async addMenuItem(item: MenuItem): Promise<void> {
    await fetch(`${this.baseUrl}/menu-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`); });
  }

  async updateMenuItem(item: MenuItem): Promise<void> {
    await fetch(`${this.baseUrl}/menu-items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`); });
  }

  async deleteMenuItem(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/menu-items/${id}`, { method: 'DELETE' })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`); });
  }

  async getEvents(): Promise<Event[]> {
    const events = await this.fetchJson<Event[]>(`${this.baseUrl}/events`);
    return events.map((e) => ({ ...e, date: new Date(e.date) }));
  }

  async getEvent(id: string): Promise<Event | null> {
    const response = await fetch(`${this.baseUrl}/events/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const e = await response.json();
    return { ...e, date: new Date(e.date) };
  }

  async createEvent(event: Event): Promise<void> {
    await fetch(`${this.baseUrl}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...event, date: event.date.toISOString() }),
    }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`); });
  }

  async updateEvent(event: Event): Promise<void> {
    await fetch(`${this.baseUrl}/events/${event.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...event, date: event.date.toISOString() }),
    }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`); });
  }

  async deleteEvent(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/events/${id}`, { method: 'DELETE' })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`); });
  }

  async getEventConsumptions(eventId: string): Promise<MemberConsumption[]> {
    return this.fetchJson<MemberConsumption[]>(`${this.baseUrl}/events/${eventId}/consumptions`);
  }

  async updateConsumption(consumption: MemberConsumption): Promise<void> {
    await fetch(`${this.baseUrl}/events/${consumption.eventId}/consumptions/${consumption.memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consumption),
    }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`); });
  }

  async deleteConsumption(eventId: string, memberId: string): Promise<void> {
    await fetch(`${this.baseUrl}/events/${eventId}/consumptions/${memberId}`, { method: 'DELETE' })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`); });
  }

  async clearAllData(): Promise<void> {
    await fetch(`${this.baseUrl}/clear-all`, { method: 'POST' })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`); });
  }
}
