import { supabase } from '../lib/supabase';
import { IDataRepository } from './IDataRepository';
import { Member, MenuItem, Event, MemberConsumption } from '../types/models';
import { Database } from '../types/database';

type EventRow = Database['public']['Tables']['events']['Row'];
type EventMemberRow = Database['public']['Tables']['event_members']['Row'];
type EventPresetItemRow = Database['public']['Tables']['event_preset_items']['Row'];
type ConsumptionItemRow = Database['public']['Tables']['consumption_items']['Row'];
type ConsumptionSharedItemRow = Database['public']['Tables']['consumption_shared_items']['Row'];

type ConsumptionRowWithRelations = Database['public']['Tables']['member_consumptions']['Row'] & {
  consumption_items: ConsumptionItemRow[] | null;
  consumption_shared_items: ConsumptionSharedItemRow[] | null;
};

interface EventRowWithRelations extends EventRow {
  event_members: EventMemberRow[] | null;
  event_preset_items: EventPresetItemRow[] | null;
}

/**
 * Optimized Supabase Repository with nested queries to eliminate N+1 problem
 * 
 * Performance improvements:
 * - getEvents(): 21 queries → 1 query (for 10 events)
 * - getEvent(): 3 queries → 1 query
 * - getEventConsumptions(): 10+ queries → 1 query
 */
export class SupabaseRepository implements IDataRepository {

  private mapRowToEvent(row: EventRowWithRelations): Event {
    return {
      id: row.id,
      date: new Date(row.date),
      name: row.name ?? undefined,
      payerId: row.payer_id,
      totalAmount: row.total_amount,
      tip: row.tip,
      presentMemberIds: row.event_members?.map((em) => em.member_id) || [],
      selfPaidMemberIds: row.event_members?.filter((em) => em.paid_self).map((em) => em.member_id) || [],
      presetItems: row.event_preset_items && row.event_preset_items.length > 0
        ? row.event_preset_items.map((pi) => ({
            menuItemId: pi.menu_item_id,
            quantity: pi.quantity
          }))
        : undefined,
      status: row.status as Event['status']
    };
  }
  
  // ===== MEMBERS =====
  
  async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data.map(row => ({
      id: row.id,
      name: row.name,
      isCore: row.is_core,
      revolutUsername: row.revolut_username ?? undefined,
      bankAccount: row.bank_account ?? undefined
    }));
  }
  
  async addMember(member: Member): Promise<void> {
    const { error } = await supabase
      .from('members')
      .insert({
        id: member.id,
        name: member.name,
        is_core: member.isCore,
        revolut_username: member.revolutUsername,
        bank_account: member.bankAccount
      });
    
    if (error) throw error;
  }
  
  async updateMember(member: Member): Promise<void> {
    const { error } = await supabase
      .from('members')
      .update({
        name: member.name,
        is_core: member.isCore,
        revolut_username: member.revolutUsername,
        bank_account: member.bankAccount
      })
      .eq('id', member.id);
    
    if (error) throw error;
  }
  
  async deleteMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
  
  // ===== MENU ITEMS =====
  
  async getMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      category: row.category as MenuItem['category'],
      isShared: row.is_shared,
      isFavorite: row.is_favorite
    }));
  }
  
  async addMenuItem(item: MenuItem): Promise<void> {
    const { error } = await supabase
      .from('menu_items')
      .insert({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        is_shared: item.isShared,
        is_favorite: item.isFavorite || false
      });
    
    if (error) throw error;
  }
  
  async updateMenuItem(item: MenuItem): Promise<void> {
    const { error } = await supabase
      .from('menu_items')
      .update({
        name: item.name,
        price: item.price,
        category: item.category,
        is_shared: item.isShared,
        is_favorite: item.isFavorite || false
      })
      .eq('id', item.id);
    
    if (error) throw error;
  }
  
  async deleteMenuItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
  
  // ===== EVENTS =====
  
  /**
   * OPTIMIZED: Single query with nested relations
   * Before: 1 + N×2 queries (21 for 10 events)
   * After: 1 query
   */
  async getEvents(): Promise<Event[]> {
    const { data: eventsData, error } = await supabase
      .from('events')
      .select(`
        *,
        event_members (
          member_id,
          paid_self
        ),
        event_preset_items (
          menu_item_id,
          quantity
        )
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return eventsData.map(row => this.mapRowToEvent(row));
  }
  
  /**
   * OPTIMIZED: Single query with nested relations
   * Before: 3 queries
   * After: 1 query
   */
  async getEvent(id: string): Promise<Event | null> {
    const { data: row, error } = await supabase
      .from('events')
      .select(`
        *,
        event_members (
          member_id,
          paid_self
        ),
        event_preset_items (
          menu_item_id,
          quantity
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    return this.mapRowToEvent(row);
  }
  
  async createEvent(event: Event): Promise<void> {
    // Insert event
    const { error: eventError } = await supabase
      .from('events')
      .insert({
        id: event.id,
        date: event.date.toISOString(),
        name: event.name,
        payer_id: event.payerId,
        total_amount: event.totalAmount,
        tip: event.tip,
        status: event.status
      });
    
    if (eventError) throw eventError;
    
    // Insert event members (batch insert)
    if (event.presentMemberIds.length > 0) {
      const eventMembers = event.presentMemberIds.map(memberId => ({
        event_id: event.id,
        member_id: memberId,
        paid_self: event.selfPaidMemberIds?.includes(memberId) || false
      }));
      
      const { error: membersError } = await supabase
        .from('event_members')
        .insert(eventMembers);
      
      if (membersError) throw membersError;
    }
    
    // Insert preset items (batch insert)
    if (event.presetItems && event.presetItems.length > 0) {
      const presetItems = event.presetItems.map(item => ({
        event_id: event.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('event_preset_items')
        .insert(presetItems);
      
      if (itemsError) throw itemsError;
    }
  }
  
  async updateEvent(event: Event): Promise<void> {
    // Update event
    const { error: eventError } = await supabase
      .from('events')
      .update({
        date: event.date.toISOString(),
        name: event.name,
        payer_id: event.payerId,
        total_amount: event.totalAmount,
        tip: event.tip,
        status: event.status
      })
      .eq('id', event.id);
    
    if (eventError) throw eventError;
    
    // Delete existing event members (cascade handled by DB)
    await supabase
      .from('event_members')
      .delete()
      .eq('event_id', event.id);
    
    // Insert new event members (batch insert)
    if (event.presentMemberIds.length > 0) {
      const eventMembers = event.presentMemberIds.map(memberId => ({
        event_id: event.id,
        member_id: memberId,
        paid_self: event.selfPaidMemberIds?.includes(memberId) || false
      }));
      
      await supabase
        .from('event_members')
        .insert(eventMembers);
    }
    
    // Delete existing preset items
    await supabase
      .from('event_preset_items')
      .delete()
      .eq('event_id', event.id);
    
    // Insert new preset items (batch insert)
    if (event.presetItems && event.presetItems.length > 0) {
      const presetItems = event.presetItems.map(item => ({
        event_id: event.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity
      }));
      
      await supabase
        .from('event_preset_items')
        .insert(presetItems);
    }
  }
  
  async deleteEvent(id: string): Promise<void> {
    // Cascade delete will handle event_members, event_preset_items, consumptions
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
  
  // ===== CONSUMPTIONS =====
  
  /**
   * OPTIMIZED: Single query with nested relations
   * Before: 1 + N×2 queries (10+ for 5 consumptions)
   * After: 1 query
   */
  async getEventConsumptions(eventId: string): Promise<MemberConsumption[]> {
    const { data: consumptionsData, error } = await supabase
      .from('member_consumptions')
      .select(`
        *,
        consumption_items (
          menu_item_id,
          quantity
        ),
        consumption_shared_items (
          menu_item_id
        )
      `)
      .eq('event_id', eventId);
    
    if (error) throw error;
    
    return ((consumptionsData || []) as ConsumptionRowWithRelations[]).map(row => ({
      eventId: row.event_id,
      memberId: row.member_id,
      items: row.consumption_items?.map((item: ConsumptionItemRow) => ({
        menuItemId: item.menu_item_id,
        quantity: item.quantity
      })) || [],
      sharedItemIds: row.consumption_shared_items?.map((s: ConsumptionSharedItemRow) => s.menu_item_id) || [],
      paidEntryFeeForIds: [], // Not implemented in schema yet
      hasPaid: row.has_paid,
      totalAmount: row.total_amount
    }));
  }
  
  /**
   * OPTIMIZED: Batch delete + insert operations
   */
  async updateConsumption(consumption: MemberConsumption): Promise<void> {
    // Upsert consumption record
    const { data: consumptionData, error: upsertError } = await supabase
      .from('member_consumptions')
      .upsert({
        event_id: consumption.eventId,
        member_id: consumption.memberId,
        has_paid: consumption.hasPaid,
        total_amount: consumption.totalAmount
      }, {
        onConflict: 'event_id,member_id'
      })
      .select('id')
      .single();
    
    if (upsertError) throw upsertError;
    
    const consumptionId = consumptionData.id;
    
    // Batch delete existing items (both types in parallel)
    await Promise.all([
      supabase
        .from('consumption_items')
        .delete()
        .eq('consumption_id', consumptionId),
      supabase
        .from('consumption_shared_items')
        .delete()
        .eq('consumption_id', consumptionId)
    ]);
    
    // Batch insert new items (both types in parallel)
    const insertPromises = [];
    
    if (consumption.items.length > 0) {
      const items = consumption.items.map(item => ({
        consumption_id: consumptionId,
        menu_item_id: item.menuItemId,
        quantity: item.quantity
      }));
      
      insertPromises.push(
        supabase.from('consumption_items').insert(items)
      );
    }
    
    if (consumption.sharedItemIds.length > 0) {
      const sharedItems = consumption.sharedItemIds.map(itemId => ({
        consumption_id: consumptionId,
        menu_item_id: itemId
      }));
      
      insertPromises.push(
        supabase.from('consumption_shared_items').insert(sharedItems)
      );
    }
    
    if (insertPromises.length > 0) {
      await Promise.all(insertPromises);
    }
  }
  
  async deleteConsumption(eventId: string, memberId: string): Promise<void> {
    // Get consumption ID
    const { data: consumptionData } = await supabase
      .from('member_consumptions')
      .select('id')
      .eq('event_id', eventId)
      .eq('member_id', memberId)
      .single();
    
    if (!consumptionData) return;
    
    // Delete consumption (cascade will delete items and shared items)
    const { error } = await supabase
      .from('member_consumptions')
      .delete()
      .eq('id', consumptionData.id);
    
    if (error) throw error;
  }
  
  // ===== BULK OPERATIONS =====
  
  /**
   * OPTIMIZED: Batch delete operations in parallel where possible
   */
  async clearAllData(): Promise<void> {
    // Delete related data in parallel (they don't depend on each other)
    await Promise.all([
      supabase.from('consumption_shared_items').delete().neq('consumption_id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('consumption_items').delete().neq('consumption_id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('event_preset_items').delete().neq('event_id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('event_members').delete().neq('event_id', '00000000-0000-0000-0000-000000000000')
    ]);
    
    // Delete consumptions (depends on items being deleted first)
    await supabase.from('member_consumptions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Delete events (depends on event_members and event_preset_items)
    await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Delete base tables in parallel (no dependencies)
    await Promise.all([
      supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    ]);
  }
}
