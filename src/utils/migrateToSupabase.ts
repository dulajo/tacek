import { LocalStorageRepository } from '../repositories/LocalStorageRepository';
import { SupabaseRepository } from '../repositories/SupabaseRepository';

/**
 * Utility pro migraci dat z LocalStorage do Supabase
 * 
 * Použití:
 * 1. V console prohlížeče zavolej: window.migrateToSupabase()
 * 2. Nebo přidej dočasné tlačítko do UI
 */
export async function migrateLocalStorageToSupabase() {
  const localRepo = new LocalStorageRepository();
  const supabaseRepo = new SupabaseRepository();
  
  console.log('🚀 Starting migration from LocalStorage to Supabase...');
  
  try {
    // Migrate members
    console.log('📋 Migrating members...');
    const members = await localRepo.getMembers();
    for (const member of members) {
      try {
        await supabaseRepo.addMember(member);
        console.log(`  ✅ Migrated member: ${member.name}`);
      } catch (error: unknown) {
        // Skip if already exists (duplicate key error)
        if (error instanceof Object && 'code' in error && error.code === '23505') {
          console.log(`  ⏭️  Member already exists: ${member.name}`);
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ Migrated ${members.length} members`);
    
    // Migrate menu items
    console.log('📋 Migrating menu items...');
    const menuItems = await localRepo.getMenuItems();
    for (const item of menuItems) {
      try {
        await supabaseRepo.addMenuItem(item);
        console.log(`  ✅ Migrated menu item: ${item.name}`);
      } catch (error: unknown) {
        if (error instanceof Object && 'code' in error && error.code === '23505') {
          console.log(`  ⏭️  Menu item already exists: ${item.name}`);
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ Migrated ${menuItems.length} menu items`);
    
    // Migrate events
    console.log('📋 Migrating events...');
    const events = await localRepo.getEvents();
    for (const event of events) {
      try {
        await supabaseRepo.createEvent(event);
        console.log(`  ✅ Migrated event: ${event.name || event.date.toLocaleDateString()}`);
        
        // Migrate consumptions for this event
        const consumptions = await localRepo.getEventConsumptions(event.id);
        for (const consumption of consumptions) {
          try {
            await supabaseRepo.updateConsumption(consumption);
            console.log(`    ✅ Migrated consumption for member: ${consumption.memberId}`);
          } catch (error: unknown) {
            console.error(`    ❌ Failed to migrate consumption:`, error);
          }
        }
      } catch (error: unknown) {
        if (error instanceof Object && 'code' in error && error.code === '23505') {
          console.log(`  ⏭️  Event already exists: ${event.name || event.date.toLocaleDateString()}`);
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ Migrated ${events.length} events`);
    
    console.log('🎉 Migration complete!');
    console.log('');
    console.log('Summary:');
    console.log(`  - ${members.length} members`);
    console.log(`  - ${menuItems.length} menu items`);
    console.log(`  - ${events.length} events`);
    
    return {
      success: true,
      members: members.length,
      menuItems: menuItems.length,
      events: events.length
    };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Export pro použití v browser console
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, typeof migrateLocalStorageToSupabase>).migrateToSupabase = migrateLocalStorageToSupabase;
}
