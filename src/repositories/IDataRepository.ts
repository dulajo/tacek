import { Member, MenuItem, Event, MemberConsumption } from '../types/models';

/**
 * Repository interface abstrakce pro data layer
 * Připraveno na budoucí nahrazení lokální DB backend API
 */
export interface IDataRepository {
  // Members
  getMembers(): Promise<Member[]>;
  addMember(member: Member): Promise<void>;
  updateMember(member: Member): Promise<void>;
  deleteMember(id: string): Promise<void>;
  
  // Menu
  getMenuItems(): Promise<MenuItem[]>;
  addMenuItem(item: MenuItem): Promise<void>;
  updateMenuItem(item: MenuItem): Promise<void>;
  deleteMenuItem(id: string): Promise<void>;
  
  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | null>;
  createEvent(event: Event): Promise<void>;
  updateEvent(event: Event): Promise<void>;
  deleteEvent(id: string): Promise<void>;
  
  // Consumptions
  getEventConsumptions(eventId: string): Promise<MemberConsumption[]>;
  updateConsumption(consumption: MemberConsumption): Promise<void>;
  deleteConsumption(eventId: string, memberId: string): Promise<void>;
  
  // Bulk operations
  clearAllData(): Promise<void>;
}
