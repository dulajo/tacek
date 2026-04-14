/**
 * Seed script for testing BroSplit with sample data
 * 
 * Usage:
 * 1. Open browser console on http://localhost:5173
 * 2. Copy and paste this entire file
 * 3. Run: seedTestData()
 * 4. Reload the page
 */

function seedTestData() {
  const members = [
    { id: '1', name: 'Pepa', isCore: true },
    { id: '2', name: 'Adam', isCore: true },
    { id: '3', name: 'Lukas', isCore: true },
    { id: '4', name: 'Gaba', isCore: true },
    { id: '5', name: 'Martin', isCore: false },
    { id: '6', name: 'Honza', isCore: false },
  ];

  const menuItems = [
    { id: 'm1', name: 'Pivo 0.5l', price: 50, category: 'drink', isShared: false },
    { id: 'm2', name: 'Kofola 0.5l', price: 45, category: 'drink', isShared: false },
    { id: 'm3', name: 'Čaj', price: 35, category: 'drink', isShared: false },
    { id: 'm4', name: 'Polévka', price: 60, category: 'food', isShared: false },
    { id: 'm5', name: 'Burger', price: 180, category: 'food', isShared: false },
    { id: 'm6', name: 'Hranolky', price: 70, category: 'food', isShared: false },
    { id: 'm7', name: 'Vodní dýmka', price: 300, category: 'other', isShared: true },
    { id: 'm8', name: 'Startovné', price: 50, category: 'other', isShared: false },
  ];

  const events = [
    {
      id: 'e1',
      date: new Date('2026-04-10'),
      name: 'Pub kvíz v Pivovarské',
      payerId: '1',
      totalAmount: 2350,
      tip: 200,
      presentMemberIds: ['1', '2', '3', '4'],
      presetItems: [
        { menuItemId: 'm1', quantity: 12 },
        { menuItemId: 'm3', quantity: 2 },
        { menuItemId: 'm4', quantity: 3 },
        { menuItemId: 'm7', quantity: 1 },
      ],
      status: 'open',
    },
    {
      id: 'e2',
      date: new Date('2026-04-03'),
      name: 'Kvíz na Kavárně',
      payerId: '2',
      totalAmount: 1800,
      tip: 150,
      presentMemberIds: ['1', '2', '3', '5'],
      status: 'closed',
    },
  ];

  const consumptions = [
    // Event 1
    {
      eventId: 'e1',
      memberId: '1',
      items: [
        { menuItemId: 'm1', quantity: 3 },
        { menuItemId: 'm4', quantity: 1 },
      ],
      sharedItemIds: ['m7'],
      paidEntryFeeForIds: [],
      hasPaid: false,
      totalAmount: 0,
    },
    {
      eventId: 'e1',
      memberId: '2',
      items: [
        { menuItemId: 'm1', quantity: 4 },
        { menuItemId: 'm4', quantity: 1 },
      ],
      sharedItemIds: ['m7'],
      paidEntryFeeForIds: [],
      hasPaid: false,
      totalAmount: 0,
    },
    {
      eventId: 'e1',
      memberId: '3',
      items: [
        { menuItemId: 'm1', quantity: 3 },
        { menuItemId: 'm3', quantity: 1 },
      ],
      sharedItemIds: [],
      paidEntryFeeForIds: [],
      hasPaid: false,
      totalAmount: 0,
    },
    {
      eventId: 'e1',
      memberId: '4',
      items: [
        { menuItemId: 'm1', quantity: 2 },
        { menuItemId: 'm3', quantity: 1 },
        { menuItemId: 'm4', quantity: 1 },
      ],
      sharedItemIds: [],
      paidEntryFeeForIds: [],
      hasPaid: false,
      totalAmount: 0,
    },
    // Event 2
    {
      eventId: 'e2',
      memberId: '1',
      items: [{ menuItemId: 'm1', quantity: 2 }],
      sharedItemIds: [],
      paidEntryFeeForIds: [],
      hasPaid: true,
      totalAmount: 0,
    },
    {
      eventId: 'e2',
      memberId: '2',
      items: [{ menuItemId: 'm1', quantity: 3 }],
      sharedItemIds: [],
      paidEntryFeeForIds: [],
      hasPaid: true,
      totalAmount: 0,
    },
    {
      eventId: 'e2',
      memberId: '3',
      items: [{ menuItemId: 'm3', quantity: 2 }],
      sharedItemIds: [],
      paidEntryFeeForIds: [],
      hasPaid: true,
      totalAmount: 0,
    },
    {
      eventId: 'e2',
      memberId: '5',
      items: [{ menuItemId: 'm1', quantity: 1 }],
      sharedItemIds: [],
      paidEntryFeeForIds: [],
      hasPaid: true,
      totalAmount: 0,
    },
  ];

  localStorage.setItem('brosplit_members', JSON.stringify(members));
  localStorage.setItem('brosplit_menu_items', JSON.stringify(menuItems));
  localStorage.setItem('brosplit_events', JSON.stringify(events));
  localStorage.setItem('brosplit_consumptions', JSON.stringify(consumptions));

  console.log('✅ Test data seeded successfully!');
  console.log('📊 Summary:');
  console.log(`  - ${members.length} members (${members.filter(m => m.isCore).length} core)`);
  console.log(`  - ${menuItems.length} menu items`);
  console.log(`  - ${events.length} events`);
  console.log(`  - ${consumptions.length} consumptions`);
  console.log('');
  console.log('🔄 Reload the page to see the data!');
}

// Run it
seedTestData();
