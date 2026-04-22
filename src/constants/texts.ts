/**
 * Centralizované texty Tácek aplikace
 * Se zdravou dávkou sarkasmu a reality checks
 */

export const TEXTS = {
  // ===== LOADING STATES =====
  loading: {
    messages: [
      "Počítám kolik kdo dluží...",
      "Hledám kreativní výmluvy proč nezaplatili...",
      "Připomínám že Revolut existuje...",
      "Kontroluji jestli to není sci-fi film...",
      "Hledám Pepovu důvěryhodnost...",
      "Počítám kolikrát už někdo slíbil že zítra zaplatí...",
      "Generujem výmluvy proč to trvá tak dlouho..."
    ],
    default: "Načítám data..."
  },

  // ===== PLACEHOLDERS =====
  placeholders: {
    eventName: "Např. Další večer kde Gaba 'zapomněl' peněženku",
    memberName: "Jméno dalšího potenciálního dlužníka",
    revolutUsername: "Pokud máš Revolut. Což asi nemáš.",
    bankAccount: "To číslo co nikdo nikdy nepoužije",
    menuItemName: "Název položky (pravděpodobně pivo)",
    menuItemPrice: "Cena (vždycky víc než si myslíš)",
    totalAmount: "Kolik to tentokrát stálo",
    tip: "Dýško (protože jste štědří s cizíma penězma)"
  },

  // ===== BUTTONS =====
  buttons: {
    // Generic
    save: "Uložit",
    cancel: "Zrušit",
    edit: "Upravit",
    delete: "🗑️ Předstírat že se to nestalo",
    close: "Zavřít",
    
    // Events
    createEvent: "Vytvořit událost",
    editEvent: "Upravit událost",
    deleteEvent: "🗑️ Smazat",
    closeEvent: "✅ Uzavřít (a doufat že všichni zaplatí)",
    reopenEvent: "Otevřít znovu",
    copySummary: "📋 Zkopírovat a poslat do prázdna",
    
    // Members
    addMember: "Přidat člena",
    
    // Menu
    addMenuItem: "➕ Přidat další hřích",
    
    // Consumption
    addItems: "Přidat položky ▼",
    hideItems: "Skrýt ▲",
    
    // Payment
    markPaid: "Označit zaplaceno",
    markPaidSarcastic: "💸 Zaplatil jsem (překvapivě)",
    
    // Migration
    migrate: "Migrovat data (na vlastní riziko)"
  },

  // ===== NOTIFICATIONS / TOASTS =====
  notifications: {
    eventCreated: "✅ Událost vytvořena. Teď už jen přimět lidi aby zaplatili.",
    eventUpdated: "💾 Událost upravena. Ne že by to někoho zajímalo.",
    eventDeleted: "🗑️ Událost smazána. Jako by se to nikdy nestalo.",
    eventClosed: "✅ Událost uzavřena. Teď už jen čekat na platby...",
    eventReopened: "🔓 Událost otevřena. Protože někdo zase nezaplatil.",
    
    memberAdded: "👤 Člen přidán. Další potenciální dlužník.",
    memberUpdated: "💾 Člen upraven.",
    memberDeleted: "👋 Člen odstraněn. Konečně.",
    
    menuItemAdded: "🍺 Položka přidána do menu.",
    menuItemUpdated: "💾 Položka upravena.",
    menuItemDeleted: "🗑️ Položka smazána.",
    
    summaryCopied: "📋 Zkopírováno. Teď to pošli do skupiny a čekej 3 dny než někdo odpoví.",
    linkCopied: "📋 Odkaz zkopírován. Jako by to někdo opravdu použil.",
    copyFailed: "❌ Nepodařilo se zkopírovat. Zkus to prosím ručně.",
    paymentMarked: "💸 Platba zaznamenána. Wow, někdo opravdu zaplatil!",
    
    migrationSuccess: "🎉 Migrace dokončena. Doufejme že nic nechybí.",
    migrationFailed: "❌ Migrace selhala. Asi to nebylo meant to be."
  },

  // ===== ERROR MESSAGES =====
  errors: {
    // Validation
    requiredField: "Zadej {field}. Povinné pole není návrh.",
    invalidAmount: "Zadej platnou částku. Záporné číslo není sleva.",
    noMembers: "Vyber aspoň jednoho člena. Nebo to bylo setkání s duchem?",
    noPayer: "Vyber platiče. Někdo to musel zaplatit, ne?",
    noMenuItems: "Přidej aspoň jednu položku do menu. Přeci jste něco jedli?",
    
    // Event validation
    missingItems: "⚠️ Chybí rozdělit: {items}",
    exceededItems: "🔴 Překročeno: {items}. Někdo si vzal víc než bylo na účtence.",
    mismatchAmount: "⚠️ Rozdíl {amount} Kč. Někdo tajně pil nebo umíte špatně počítat.",
    
    // Payment info
    noRevolutUsername: "💸 {name} nemá Revolut. V roce 2026. Seriously?",
    noBankAccount: "🏦 {name} nemá číslo účtu. Jak má dostat peníze, holubem?",
    noPaymentInfo: "⚠️ Platič nemá nastavený Revolut ani účet. Asi čeká na bitcoiny.",
    
    // Empty states (pro dashboard/listy)
    emptyEvents: "Zatím žádné události. Jděte konečně ven.",
    emptyMembers: "Žádní členové. Smutné. Přidej nějaké kamarády (pokud máš).",
    emptyMenuItems: "Prázdný jídelní lístek. Co to je, dietní pub?",
    noConsumption: "Nikdo nic neměl? Tak proč jste tam vůbec byli?",
    
    // Technical
    loadFailed: "❌ Načítání selhalo. Zkus to znovu, nebo se smiř s osudem.",
    saveFailed: "❌ Uložení selhalo. Internet existuje, že?",
    deleteFailed: "❌ Smazání selhalo. Asi to tam má zůstat."
  },

  // ===== WARNINGS =====
  warnings: {
    deleteEvent: "Opravdu chcete smazat tuto událost? Tato akce je nevratná.",
    deleteMember: "Opravdu chcete smazat {name}? Všechny jejich dluhy zmizí s nimi.",
    deleteMenuItem: "Opravdu chcete smazat {item}?",
    editClosedEvent: "Událost je uzavřená. Opravdu chcete upravit?",
    unsavedChanges: "Máte neuložené změny. Opravdu chcete odejít?",
    noDraftFound: "Žádná rozpracovaná událost nebyla nalezena.",
    continueOrNew: "Máte rozpracovanou událost. Chcete pokračovat nebo začít novou?"
  },

  // ===== LABELS & HEADINGS =====
  labels: {
    // Dashboard
    dashboardTitle: "Tácek",
    dashboardSubtitle: "Kde přátelství končí a dluhy začínají",
    
    // Events
    events: "události",
    eventName: "Název události",
    eventDate: "Datum",
    totalAmount: "Celková částka",
    tip: "Dýško",
    payer: "Platič",
    presentMembers: "Přítomní členové",
    status: "Stav",
    
    // Members
    members: "Členové",
    memberName: "Jméno",
    coreMember: "⭐ Core člen (chodí pravidelně)",
    substitute: "Náhradník (občas zaskočí)",
    revolutUsername: "Revolut username",
    bankAccount: "Číslo účtu",
    
    // Menu
    menuItems: "Jídelní lístek",
    itemName: "Název položky",
    price: "Cena",
    category: "Kategorie",
    sharedItem: "🔄 Sdílená položka (dýmka, dezert...)",
    favoriteItem: "⭐ Oblíbená položka",
    
    // Categories
    food: "Jídlo",
    drink: "Pití",
    other: "Ostatní",
    
    // Consumption
    consumption: "Konzumace",
    items: "Položky",
    sharedItems: "Sdílené položky",
    tipShare: "Dýško (podíl)",
    totalOwed: "Celkem k zaplacení",
    
    // Payment
    paid: "Zaplaceno",
    unpaid: "Nezaplaceno",
    paidSelf: "💰 Platil si sám",
    paymentInfo: "Platební údaje",
    
    // Status
    open: "Otevřená",
    closed: "Uzavřená",
    
    // Summary
    summary: "Přehled",
    breakdown: "Rozpis",
    totalToCollect: "Celkem k vybrání",
    alreadyPaid: "✅ Zaplaceno",
    waitingFor: "⏳ Čeká se",
    
    // Other
    actions: "Akce",
    details: "Detail",
    back: "Zpět",
    manage: "Spravovat",
    add: "Přidat",
    remove: "Odebrat",
    quantity: "Počet",
    remaining: "zbývá"
  },

  // ===== EASTER EGGS =====
  easterEggs: {
    achievement10Events: "🏆 10 událostí. Máte rádi hospody, nebo jen dlužníky?",
    achievement50Events: "🎖️ 50 událostí. Měli byste asi méně chodit ven... nebo víc?",
    achievement100Events: "👑 100 událostí. Jste legendy. Nebo alkoholici. Pravděpodobně obojí.",
    
    chronicDebtor: "🏃 {name} má {count} nezaplacených událostí. Asi čeká na výplatu... z roku 2027.",
    bigDebt: "💰 {name} dluží {amount} Kč. To je víc než GDP malého státu.",
    alwaysSelfPaid: "💎 {name} platí vždy sám. Podezřele zodpovědné chování.",
    fastPayment: "⚡ Všichni zaplatili do 24h? Zkontroluj jestli to není sci-fi film.",
    
    welcome: "👋 Vítej v Tácku. Kde přátelství končí a dluhy začínají.",
    emptyWallet: "👛 Událost za 0 Kč. Vzduch dneska zdražil?"
  },

  // ===== HELP TEXTS =====
  helpTexts: {
    revolutUsername: "Pro rychlé platby přes Revolut (např. @pepa123)",
    bankAccount: "Pro bankovní převody (např. 123456789/0800)",
    coreMember: "Core členové se automaticky předvyplní při vytváření události",
    sharedItem: "Sdílené položky se dělí mezi několik lidí (vodní dýmka, dezert...)",
    favoriteItem: "Oblíbené položky se zobrazí nahoře při výběru",
    paidSelf: "Tento člověk si platil sám → nebude mu počítáno dýško",
    presetItems: "Zadej produkty z účtenky. Pak se budou rozdělovat mezi členy.",
    variantB: "Zadej jen celkovou částku. Členové si sami vyberou co měli."
  }
};

/**
 * Helper pro formátování textu s parametry
 * Použití: formatText(TEXTS.errors.noRevolutUsername, { name: 'Pepa' })
 */
export function formatText(template: string, params: Record<string, string | number | boolean>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => params[key]?.toString() || '');
}
