# Testovací scénáře BroSplit

## Příprava testování

### 1. Instalace a spuštění
```bash
npm install
npm run dev
```

### 2. Naplnění testovacími daty
V prohlížeči otevřete Developer Tools (F12), přejděte na Console a spusťte:
```bash
# Zkopírujte obsah seed-test-data.js do konzole
```

Nebo použijte prázdnou databázi a přidávejte data manuálně.

## Test Case 1: Správa členů

### Postup:
1. Klikněte na "Spravovat" u sekce Členové
2. Přidejte nového core člena "Pepa"
3. Přidejte náhradníka "Martin"
4. Upravte Pepu na náhradníka
5. Upravte Martina na core člena
6. Smažte jednoho člena

### Očekávaný výsledek:
- ✅ Lze vytvořit a spravovat seznam členů s příznakem core/náhradník
- ✅ Core členové jsou vizuálně odlišeni hvězdičkou ⭐

## Test Case 2: Správa jídelního lístku

### Postup:
1. Klikněte na "📋 Jídelní lístek"
2. Přidejte položku "Pivo" (Pití, 50 Kč)
3. Přidejte položku "Burger" (Jídlo, 180 Kč)
4. Přidejte položku "Vodní dýmka" (Ostatní, 300 Kč, Sdílená ✓)
5. Přidejte položku "Startovné" (Ostatní, 50 Kč)
6. Upravte cenu piva na 55 Kč
7. Smažte jednu položku

### Očekávaný výsledek:
- ✅ Lze vytvořit a spravovat jídelní lístek s kategoriemi
- ✅ Položky jsou rozděleny podle kategorií (Pití, Jídlo, Ostatní)
- ✅ Sdílené položky jsou vizuálně označeny

## Test Case 3: Vytvoření události - Varianta A (s účtenkou)

### Postup:
1. Klikněte na "+ Nová událost"
2. Zadejte datum: dnešní datum
3. Zadejte název: "Pub kvíz v Pivovarské"
4. Vyberte přítomné členy (core jsou předvyplněni)
5. Odškrtněte jednoho core člena
6. Přidejte jednoho náhradníka
7. Vyberte platiče: První člen
8. Zadejte celkovou částku: 2500 Kč
9. Zadejte dýško: 200 Kč
10. Zaškrtněte "Mám účtenku..."
11. Přidejte produkty:
    - Pivo × 10
    - Polévka × 3
    - Vodní dýmka × 1
12. Klikněte "Vytvořit událost"

### Očekávaný výsledek:
- ✅ Při vytváření události jsou předvyplněni všichni core členové
- ✅ Lze upravit výběr členů (odebrat core, přidat náhradníky)
- ✅ Lze zadat produkty z účtenky při vytváření události
- ✅ Součet produktů je zobrazen

## Test Case 4: Vytvoření události - Varianta B (bez účtenky)

### Postup:
1. Vytvořte novou událost
2. Zadejte jen datum, platiče a celkovou částku
3. NEZAŠKRTÁVEJTE "Mám účtenku"
4. Vytvořte událost

### Očekávaný výsledek:
- ✅ Událost lze vytvořit bez přednastavených produktů
- ✅ Produkty se budou zadávat až v detailu události

## Test Case 5: Zadávání konzumace

### Postup:
1. Otevřete vytvořenou událost
2. V sekci "Přidat/upravit konzumaci" vyberte prvního člena
3. Přidejte položky:
   - Pivo: 3 ks (použijte + tlačítko)
   - Polévka: 1 ks
4. Přihlaste se ke sdílené položce "Vodní dýmka"
5. Klikněte "Uložit"
6. Opakujte pro další členy

### Očekávaný výsledek:
- ✅ Každý člen si může zakliknout svou konzumaci
- ✅ Živé zobrazení mezivýpočtů (cena × počet)
- ✅ Celková částka se průběžně aktualizuje
- ✅ Funguje přihlášení ke sdíleným položkám

## Test Case 6: Sdílené položky

### Postup:
1. V události s vodní dýmkou se přihlaste ke sdílené položce
2. Nechte přihlásit 3 členy
3. Zkontrolujte, že cena je rozdělena rovnoměrně (300 Kč / 3 = 100 Kč)
4. Odhlaste jednoho člena
5. Zkontrolujte přepočet (300 Kč / 2 = 150 Kč)

### Očekávaný výsledek:
- ✅ Sdílená položka se rovnoměrně rozdělí mezi přihlášené
- ✅ Při změně počtu přihlášených se přepočítá

## Test Case 7: Validace - Varianta A

### Postup:
1. V události s účtenkou (10 piv, 3 polévky, 1 dýmka)
2. Zadejte konzumaci jen pro 8 piv, 2 polévky
3. Zkontrolujte varování nahoře

### Očekávaný výsledek:
- ✅ Zobrazí se varování "Chybí rozebrání X Kč"
- ✅ Varování je žluté (nedostatek)
- ✅ Pokud překročíte, varování bude červené

## Test Case 8: Validace - Varianta B

### Postup:
1. V události bez účtenky (celková částka 2000 Kč, dýško 200 Kč)
2. Zadejte konzumaci za 1500 Kč
3. Zkontrolujte zobrazení rozdílu

### Očekávaný výsledek:
- ✅ Zobrazí se "Chybí ještě X Kč"
- ✅ Když překročíte, zobrazí se "Překročeno o X Kč"

## Test Case 9: Výpočet částek

### Postup:
1. Událost s 4 členy, celková částka 2000 Kč, dýško 200 Kč
2. Člen 1 (platič): konzumace 500 Kč
3. Člen 2: konzumace 400 Kč
4. Člen 3: konzumace 300 Kč
5. Člen 4: konzumace 300 Kč
6. Zkontrolujte částky

### Očekávaný výsledek:
- ✅ Dýško 200 Kč / 4 = 50 Kč na osobu
- ✅ Člen 1 (platič): 0 Kč k zaplacení
- ✅ Člen 2: 400 + 50 = 450 Kč
- ✅ Člen 3: 300 + 50 = 350 Kč
- ✅ Člen 4: 300 + 50 = 350 Kč
- ✅ Součet: 450 + 350 + 350 = 1150 Kč (platič dostal 1150 Kč zpět z 2000 Kč)

## Test Case 10: Evidence plateb

### Postup:
1. U každého člena (kromě platiče) klikněte "Označit zaplaceno"
2. Zkontrolujte vizuální změnu
3. Odškrtněte platbu
4. Zkontrolujte změnu zpět

### Očekávaný výsledek:
- ✅ Lze označit/odznačit platbu pro každého člena
- ✅ Zaplacené položky jsou vizuálně odlišeny (šedé, průhledné)
- ✅ Nezaplacené jsou zvýrazněné

## Test Case 11: Uzavření/otevření události

### Postup:
1. V otevřené události klikněte "Uzavřít událost"
2. Zkontrolujte změnu stavu
3. Vraťte se na dashboard
4. Zkontrolujte, že událost je označena jako "Uzavřená"
5. Otevřete událost znovu
6. Klikněte "Otevřít událost"

### Očekávaný výsledek:
- ✅ Lze uzavřít/otevřít událost
- ✅ Stav je viditelný na dashboardu
- ✅ Možnost znovu otevřít uzavřenou událost

## Test Case 12: Historie událostí

### Postup:
1. Vytvořte 3 události s různými daty
2. Vraťte se na dashboard
3. Zkontrolujte pořadí (nejnovější nahoře)
4. Klikněte na starší událost
5. Zkontrolujte všechny detaily

### Očekávaný výsledek:
- ✅ Seznam všech událostí s datem
- ✅ Nejnovější události nahoře
- ✅ Detail události zobrazuje všechny informace

## Test Case 13: Sdílitelný link

### Postup:
1. V detailu události klikněte "Kopírovat" u sdílitelného odkazu
2. Otevřete nové okno v inkognito režimu
3. Vložte odkaz
4. Zkontrolujte, že se událost otevře

### Očekávaný výsledek:
- ✅ Sdílitelný link funguje
- ✅ Link otevře událost bez nutnosti přihlášení

## Test Case 14: Responzivita - Mobilní zobrazení

### Postup:
1. Otevřete Developer Tools (F12)
2. Přepněte na mobilní zobrazení (iPhone)
3. Projděte všechny stránky
4. Zkontrolujte použitelnost

### Očekávaný výsledek:
- ✅ Všechny tlačítka mají min 44×44 px
- ✅ Formuláře jsou použitelné na mobilu
- ✅ Texty jsou čitelné
- ✅ Layout se přizpůsobí

## Test Case 15: Persistence dat

### Postup:
1. Vytvořte člena, položku menu a událost
2. Obnovte stránku (F5)
3. Zkontrolujte, že data zůstala

### Očekávaný výsledek:
- ✅ Data přežijí refresh stránky
- ✅ Všechna data jsou uložena v LocalStorage

## Test Case 16: Změna ceny v menu

### Postup:
1. Vytvořte položku "Pivo" za 50 Kč
2. Vytvořte událost s 5 pivy
3. Změňte cenu piva na 60 Kč
4. Zkontrolujte starou událost
5. Vytvořte novou událost s pivy

### Očekávaný výsledek:
- ✅ Stará událost počítá s 50 Kč
- ✅ Nová událost počítá s 60 Kč
- ✅ Změna ceny neovlivňuje staré události

## Kritéria akceptace - Checklist

Po provedení všech testů zkontrolujte:

- ✅ 1. Lze vytvořit a spravovat seznam členů s příznakem core/náhradník
- ✅ 2. Core členové jsou vizuálně odlišeni (hvězdička)
- ✅ 3. Lze vytvořit a spravovat jídelní lístek s kategoriemi
- ✅ 4. Lze vytvořit událost s přítomými členy a celkovou částkou (varianta A i B)
- ✅ 5. Při vytváření události jsou předvyplněni všichni core členové
- ✅ 6. Lze upravit výběr členů (odebrat core, přidat náhradníky)
- ✅ 7. Lze zadat produkty z účtenky při vytváření události
- ✅ 8. Každý člen si může zakliknout svou konzumaci
- ✅ 9. Živé zobrazení mezivýpočtů a celkových částek
- ✅ 10. Správný výpočet: konzumace + proporcionální dýško = částka k zaplacení
- ✅ 11. Dýško se rovnoměrně rozpočítá mezi přítomné členy
- ✅ 12. Funguje přihlášení ke sdíleným položkám s rovnoměrným rozdělením
- ✅ 13. Kontrola a varování když součet nesedí s účtem/zadanými produkty
- ✅ 14. Evidence plateb s checkboxy pro každého člena
- ✅ 15. Historie událostí s možností zobrazit detail
- ✅ 16. Možnost znovu otevřít uzavřenou událost
- ✅ 17. Responzivní design funkční na mobilu i desktopu
- ✅ 18. Data persistují v lokální databázi (přežijí refresh)
- ✅ 19. Sdílitelný link na konkrétní událost
- ⏳ 20. Aplikace dostupná na brosplit.dulove.cz (vyžaduje deployment)

## Známé limitace

- Aplikace neobsahuje autentizaci - kdokoliv může upravovat vše
- Data jsou pouze v LocalStorage - žádná synchronizace mezi zařízeními
- Jeden jídelní lístek pro všechny události
- Žádné statistiky ani reporty
