# BroSplit - Aplikace pro správu skupinové útraty na pub kvízech

## Přehled
Webová aplikace pro evidenci a rozdělení společné útraty skupiny přátel, kteří pravidelně chodí na pub kvízy. Umožňuje sledovat kdo co konzumoval, automaticky počítat co kdo dluží včetně proporcionálního rozdělení spropitného, a evidovat platby.

## Cíle
- Zjednodušit evidenci a rozdělení společných útrat
- Umožnit členům samostatně zadávat svou konzumaci
- Transparentně zobrazovat kdo kolik dluží
- Uchovávat historii událostí pro pozdější kontrolu

## Funkční požadavky

### Správa členů
- [ ] Vytvoření seznamu členů skupiny (Pepa, Adam, Lukas, Gaba, ...)
- [ ] Přidávání nových členů
- [ ] Editace jmen členů
- [ ] Příznak "core člen" (pravidelný) vs. "náhradník" (občasný)
- [ ] Možnost změnit příznak "core" u existujícího člena
- [ ] Vizuální odlišení core členů (např. hvězdička)
- [ ] Zatím není potřeba ukládat email, telefon ani jiné údaje
- [ ] Počet členů je variabilní (5-7 členů typicky)

### Správa jídelního lístku
- [ ] Globální jídelní lístek podniku sdílený mezi všemi událostmi
- [ ] Přidávání nových položek (název, cena, kategorie)
- [ ] Editace existujících položek (název, cena, kategorie)
- [ ] Kategorie: Jídlo, Pití, případně další dle potřeby
- [ ] Příznak "sdílená položka" u produktů (např. vodní dýmka)
- [ ] Speciální položka "Startovné" s pevnou cenou
- [ ] Změna ceny v jídelním lístku neovlivňuje staré události
- [ ] Kdokoliv může upravovat jídelní lístek kdykoliv (i "za běhu" během události)

### Vytvoření události

**Varianta A - s účtenkou (známé produkty):**
- [ ] Zadání základních údajů: datum, název (volitelné)
- [ ] Výběr přítomných členů ze seznamu (předvyplněni všichni "core" členové)
- [ ] Možnost odebrat core členy nebo přidat náhradníky
- [ ] Označení člena, který zaplatil účet
- [ ] Zadání celkové zaplacené částky
- [ ] Zadání produktů z účtenky s množstvím (např. 10 piv, 3 polévky, 4 čaje)
- [ ] Zadání dýška/spropitného jako absolutní částka (např. 200 Kč)

**Varianta B - bez účtenky (známa jen celková částka):**
- [ ] Zadání základních údajů: datum, název (volitelné)
- [ ] Výběr přítomných členů (předvyplněni všichni "core" členové)
- [ ] Označení platiče
- [ ] Zadání celkové zaplacené částky
- [ ] Produkty se zadávají až postupně členy

### Zadávání konzumace členy
- [ ] Výběr konkrétní události ze seznamu
- [ ] Zobrazení jídelního lístku s cenami
- [ ] Zakliknutí produktů s počtem kusů pro každého člena
- [ ] Okamžité zobrazení jednotkové ceny a mezivýpočtu (např. "Pivo 50 Kč × 3 = 150 Kč")
- [ ] Průběžný součet vlastní částky (konzumace + proporcionální dýško)
- [ ] Přihlášení se ke sdíleným položkám (např. vodní dýmka)
- [ ] Rovnoměrné rozdělení sdílené položky mezi přihlášené členy
- [ ] Všichni vidí co zaklikali ostatní členové
- [ ] Kdokoliv může upravovat konzumaci kohokoliv (bez loginu)
- [ ] Živá aktualizace součtů při změnách

### Startovné
- [ ] Startovné jako položka v jídelním lístku
- [ ] Standardně platí každý člen za sebe
- [ ] Možnost zaplatit startovné za jiného člena (navíc)
- [ ] Započítání do finální částky

### Kontrola a validace

**Varianta A (s účtenkou):**
- [ ] Kontrola že suma zakliknutých produktů = suma zadaných produktů z účtenky
- [ ] Zvýraznění rozdílu pokud nesedí (kolik chybí/přebývá)
- [ ] Varování pokud událost není kompletně rozebraná

**Varianta B (bez účtenky):**
- [ ] Zobrazení aktuálního součtu zakliknutých produktů
- [ ] Zobrazení rozdílu oproti celkové částce (např. "chybí ještě 300 Kč")
- [ ] Varování pokud součet nesedí s celkovou částkou

### Výpočet částek
- [ ] Každý člen vidí svůj součet: konzumace + proporcionální dýško + startovné
- [ ] Dýško se rozpočítává rovnoměrně mezi všechny přítomné členy
- [ ] Pokud platící člen platil i za svou konzumaci, jeho dluh = 0 Kč
- [ ] Pokud platící člen neplatil za svou konzumaci, není zahrnut v evidenci

### Evidence plateb
- [ ] Každý člen má zaškrtávátko "zaplatil jsem"
- [ ] Kdokoliv může zaškrtnout/odškrtnout platbu kohokoliv
- [ ] Stav plateb viditelný všem členům
- [ ] Vizuální indikace kdo už zaplatil a kdo ne

### Historie událostí
- [ ] Seznam všech minulých událostí s datem
- [ ] Detail události: kdo byl přítomen, kdo platil, co kdo měl, kdo kolik dluží
- [ ] Detail plateb: kdo už zaplatil
- [ ] Možnost znovu otevřít uzavřenou událost pro úpravy
- [ ] Kdokoliv může uzavřít/otevřít událost

### Sdílení
- [ ] Sdílitelný link na konkrétní událost
- [ ] Link otevře událost v aplikaci bez nutnosti přihlášení
- [ ] Přístup k aplikaci na URL: brosplit.dulove.cz

## Nefunkční požadavky

### UI/UX
- [ ] Responzivní design primárně pro mobilní zobrazení
- [ ] Funkční i na desktopu
- [ ] Jednoduché a intuitivní ovládání
- [ ] Živá aktualizace součtů bez nutnosti obnovovat stránku

### Výkon
- [ ] Okamžitá odezva při přidávání/upravování položek
- [ ] Efektivní práce s lokální databází

### Bezpečnost
- [ ] Žádný login/autentizace v první verzi
- [ ] Kdokoliv s přístupem k URL může vše upravovat
- [ ] Ochrana proti vandalismu není v první verzi potřeba

## Technický přístup

### Stack
- **Frontend:** React + TypeScript
- **Styling:** dle volby implementátora (doporučeno: TailwindCSS nebo MUI)
- **Databáze:** IndexedDB nebo localStorage (lokální v prohlížeči)
- **Hosting:** Vlastní server, aplikace dostupná z internetu na brosplit.dulove.cz

### Architektura
- Single Page Application (SPA)
- Data layer abstrahovaný přes interface/repository pattern
- Připraveno na budoucí nahrazení lokální DB backend API
- Komponenty navržené pro snadnou rozšiřitelnost

### Data model

```typescript
interface Member {
  id: string;
  name: string;
  isCore: boolean; // true = pravidelný člen, false = náhradník
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'food' | 'drink' | 'other';
  isShared: boolean; // pro položky typu vodní dýmka
}

interface Event {
  id: string;
  date: Date;
  name?: string;
  payerId: string; // kdo zaplatil
  totalAmount: number;
  tip: number; // dýško
  presentMemberIds: string[];
  presetItems?: EventItem[]; // produkty z účtenky (varianta A)
  status: 'open' | 'closed';
}

interface EventItem {
  menuItemId: string;
  quantity: number;
}

interface MemberConsumption {
  eventId: string;
  memberId: string;
  items: EventItem[];
  sharedItemIds: string[]; // IDs položek ke kterým se člen přihlásil
  hasPaid: boolean;
  totalAmount: number; // cache vypočtené částky
}
```

### Repository interface

```typescript
interface IDataRepository {
  // Members
  getMembers(): Promise<Member[]>;
  addMember(member: Member): Promise<void>;
  updateMember(member: Member): Promise<void>;
  
  // Menu
  getMenuItems(): Promise<MenuItem[]>;
  addMenuItem(item: MenuItem): Promise<void>;
  updateMenuItem(item: MenuItem): Promise<void>;
  
  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event>;
  createEvent(event: Event): Promise<void>;
  updateEvent(event: Event): Promise<void>;
  
  // Consumptions
  getEventConsumptions(eventId: string): Promise<MemberConsumption[]>;
  updateConsumption(consumption: MemberConsumption): Promise<void>;
}
```

## Omezení
- Aplikace běží pouze v prohlížeči, data jsou uložena lokálně
- Žádná synchronizace mezi zařízeními v první verzi
- Jeden podnik (jeden jídelní lístek) - rozšíření na více podniků až v budoucnu
- Statistiky až v budoucí verzi
- QR kódy pro platby až v budoucí verzi
- Revolut API integrace až v budoucí verzi
- Email notifikace až v budoucí verzi

## Okrajové případy

| Scénář | Očekávané chování |
|--------|-------------------|
| Součet konzumací > zadané produkty z účtenky | Zobrazit varování s rozdílem, zvýraznit červeně |
| Součet konzumací < zadané produkty z účtenky | Zobrazit varování s rozdílem, zvýraznit žlutě |
| Součet konzumací > celková částka (varianta B) | Zobrazit varování "překročeno o X Kč" |
| Součet konzumací < celková částka (varianta B) | Zobrazit "chybí ještě X Kč" |
| Nikdo se nepřihlásí ke sdílené položce | Částka zůstane "viset", zobrazit varování |
| Změna ceny v jídelním lístku | Ovlivní jen nové události, staré zůstávají beze změny |
| Platící člen platil i za svou konzumaci | Zobrazit "Zaplaceno: 2500 Kč, Konzumace: 350 Kč, K vrácení: 2150 Kč" |
| Platící člen neplatil za svou konzumaci | Není zahrnut v evidenci události |
| Prázdný jídelní lístek | Umožnit přidávat položky za běhu |
| Prázdný seznam členů | Umožnit přidávat členy za běhu |
| Všichni core členové předvyplněni, ale někdo nepřišel | Možnost odškrtnout nepřítomné před vytvořením události |
| Přišel náhradník místo core člena | Odškrtnout core člena, přidat náhradníka |

## UI/UX Specifikace

### Hlavní obrazovky

1. **Dashboard**
   - Seznam členů (core označeni hvězdičkou, s možností přidat/upravit)
   - Tlačítko "Nová událost"
   - Seznam událostí (nejnovější nahoře)
   - Správa jídelního lístku

2. **Vytvoření události**
   - Formulář: datum, název
   - Multi-select přítomných členů (předvyplněni všichni core členové)
   - Select platiče
   - Input celkové částky
   - Input dýška
   - Volitelně: zadání produktů z účtenky
   - Tlačítko "Vytvořit a sdílet"
   - Zobrazení sdílitelného linku

3. **Detail události**
   - Hlavička: název, datum, platič, celková částka
   - Kontrolní panel: stav (kolik rozebraných produktů, kolik chybí)
   - Tabulka členů s konzumací:
     - Jméno člena
     - Seznam zakliknutých položek s počtem
     - Mezisoucet konzumace
     - Proporcionální dýško
     - Celková částka k zaplacení
     - Checkbox "Zaplatil"
   - Formulář pro přidání konzumace:
     - Select člena
     - Jídelní lístek s možností zakliknout produkty
     - Počet kusů (+/- tlačítka)
     - Živý přepočet částky
   - Tlačítko "Uzavřít událost" / "Otevřít událost"

4. **Správa jídelního lístku**
   - Seznam položek rozdělený podle kategorií
   - Formulář pro přidání: název, cena, kategorie, checkbox "sdílená"
   - Inline editace existujících položek

5. **Správa členů**
   - Seznam všech členů (core nahoře s hvězdičkou)
   - Formulář pro přidání: jméno, checkbox "core člen"
   - Možnost editace jména a přepnutí core/náhradník

### Mobilní UX
- Velká tlačítka (min 44×44 px)
- Karty místo tabulek kde je to vhodné
- Bottom navigation nebo hamburger menu
- Swipe akce pro rychlé operace
- Pull-to-refresh na seznamech

## Kritéria akceptace

1. ✅ Lze vytvořit a spravovat seznam členů s příznakem core/náhradník
2. ✅ Core členové jsou vizuálně odlišeni (hvězdička)
3. ✅ Lze vytvořit a spravovat jídelní lístek s kategoriemi
4. ✅ Lze vytvořit událost s přítomými členy a celkovou částkou (varianta A i B)
5. ✅ Při vytváření události jsou předvyplněni všichni core členové
6. ✅ Lze upravit výběr členů (odebrat core, přidat náhradníky)
7. ✅ Lze zadat produkty z účtenky při vytváření události
8. ✅ Každý člen si může zakliknout svou konzumaci
9. ✅ Živé zobrazení mezivýpočtů a celkových částek
10. ✅ Správný výpočet: konzumace + proporcionální dýško = částka k zaplacení
11. ✅ Dýško se rovnoměrně rozpočítá mezi přítomné členy
12. ✅ Funguje přihlášení ke sdíleným položkám s rovnoměrným rozdělením
13. ✅ Kontrola a varování když součet nesedí s účtem/zadanými produkty
14. ✅ Evidence plateb s checkboxy pro každého člena
15. ✅ Historie událostí s možností zobrazit detail
16. ✅ Možnost znovu otevřít uzavřenou událost
17. ✅ Responzivní design funkční na mobilu i desktopu
18. ✅ Data persistují v lokální databázi (přežijí refresh)
19. ✅ Sdílitelný link na konkrétní událost
20. ✅ Aplikace dostupná na brosplit.dulove.cz

## Mimo rozsah (budoucí verze)

- Autentizace a přístupová práva
- Více podniků s různými jídelními lístky
- Backend API a synchronizace
- Statistiky (kdo kolik celkem utratil, jak často chodí...)
- QR kódy pro platby
- Revolut API integrace
- Email/push notifikace
- Nerovnoměrné rozdělení sdílených položek
- Export dat (PDF, Excel...)
- Ochrana proti vandalismu
- Archivace neaktivních členů
