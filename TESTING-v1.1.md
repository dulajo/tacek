# Testing Notes - v1.1.0 Features

## Nové funkce k otestování

### 1. Auto-save Draft

#### Test Case 1: Základní auto-save
1. Jděte na "Nová událost"
2. Začněte vyplňovat formulář (datum, název, částka...)
3. Počkejte 1-2 sekundy
4. Otevřete Developer Tools → Application → Local Storage
5. Zkontrolujte klíč `brosplit_event_draft`
6. ✅ Draft je uložen s aktuálními daty

#### Test Case 2: Dialog s draftem
1. Vyplňte částečně formulář pro novou událost
2. Odejděte na jinou stránku (Dashboard, Členové...)
3. Vraťte se na "Nová událost"
4. ✅ Zobrazí se dialog "Máte rozpracovanou událost"
5. Klikněte "Pokračovat"
6. ✅ Formulář je předvyplněný uloženými daty

#### Test Case 3: Zahození draftu
1. Vyplňte částečně formulář
2. Odejděte a vraťte se
3. V dialogu klikněte "Začít novou"
4. ✅ Formulář je prázdný
5. ✅ Draft je smazán z localStorage

#### Test Case 4: Vymazání draftu po vytvoření události
1. Vyplňte formulář s draftem
2. Vytvořte událost (submit)
3. Vraťte se na "Nová událost"
4. ✅ Dialog se nezobrazí (draft byl smazán)

---

### 2. Editace události

#### Test Case 5: Editace otevřené události
1. Otevřete existující otevřenou událost
2. Klikněte "✏️ Upravit"
3. ✅ Formulář je předvyplněný aktuálními daty
4. Změňte název události
5. Změňte celkovou částku
6. Přidejte/odeberte člena
7. Klikněte "Uložit změny"
8. ✅ Změny jsou uloženy
9. ✅ Přepočítaly se všechny částky

#### Test Case 6: Editace uzavřené události
1. Uzavřete nějakou událost
2. Klikněte "✏️ Upravit"
3. ✅ Zobrazí se varování "Událost je uzavřená"
4. Klikněte "Ano, upravit"
5. ✅ Formulář se otevře
6. Proveďte změny a uložte
7. ✅ Změny jsou aplikovány

#### Test Case 7: Změna členů v události
1. Upravte událost
2. Odeberte jednoho člena
3. Přidejte jiného člena
4. Uložte
5. ✅ Odebraný člen nemá konzumaci
6. ✅ Nový člen má prázdnou konzumaci
7. ✅ Součty jsou správně přepočítané

#### Test Case 8: Změna produktů z účtenky
1. Upravte událost s účtenkou
2. Změňte množství nějakého produktu
3. Přidejte nový produkt
4. Uložte
5. ✅ Validace kontroluje nový součet produktů
6. ✅ Varování se zobrazují správně

#### Test Case 9: Zrušení editace
1. Začněte editovat událost
2. Proveďte změny
3. Klikněte "Zrušit"
4. ✅ Změny nejsou uloženy
5. ✅ Vrátíte se na detail události

---

### 3. Zobrazení sdílených položek

#### Test Case 10: Detail konzumace - běžné položky
1. Otevřete událost s konzumací
2. Zkontrolujte detail člena
3. ✅ Běžné položky jsou zobrazeny s •
4. ✅ Formát: "• Pivo × 2 = 100 Kč"
5. ✅ Každá položka na samostatném řádku

#### Test Case 11: Detail konzumace - sdílené položky
1. Otevřete událost kde se někdo přihlásil ke sdílené položce
2. Zkontrolujte detail člena
3. ✅ Sekce "Sdílené položky:" je fialová
4. ✅ Formát: "• Dýmka (1/3) = 100 Kč"
5. ✅ Poměr účasti je správný
6. ✅ Částka je správně vydělená

#### Test Case 12: Detail konzumace - dýško
1. Zkontrolujte detail člena v události s dýškem
2. ✅ Sekce s dýškem je modrá
3. ✅ Formát: "• Dýško (podíl) = 50 Kč"
4. ✅ Částka odpovídá proporcionálnímu rozdělení

#### Test Case 13: Detail konzumace - celkový součet
1. Zkontrolujte detail člena
2. ✅ Součet je na konci s tučným písmem
3. ✅ Formát: "Celkem k zaplacení: 400 Kč"
4. ✅ Součet odpovídá: běžné + sdílené + dýško

#### Test Case 14: Člen bez sdílených položek
1. Zkontrolujte člena, který se nepřihlásil k žádné sdílené položce
2. ✅ Sekce "Sdílené položky:" se nezobrazuje
3. ✅ Zobrazují se jen běžné položky a dýško

#### Test Case 15: Sdílená položka s 1 účastníkem
1. Vytvořte událost se sdílenou položkou
2. Přihlaste jen 1 člena
3. ✅ Zobrazí se "(1/1)"
4. ✅ Cena je plná (není dělená)

---

## Regresní testy

Zkontrolujte že původní funkčnost stále funguje:

- ✅ Vytváření nové události (varianta A i B)
- ✅ Zadávání konzumace
- ✅ Výpočty částek jsou správné
- ✅ Platby fungují
- ✅ Uzavírání/otevírání událostí
- ✅ Správa členů
- ✅ Správa menu
- ✅ Dashboard zobrazuje události

---

## Známé problémy

### Potenciální edge cases:

1. **Draft při současné editaci více lidí:**
   - Draft je lokální v prohlížeči → každý má svůj draft
   - Není problém pro single-user použití

2. **Editace události s aktivními konzumacemi:**
   - Při odebrání člena se smaže i jeho konzumace
   - ⚠️ Může vést ke ztrátě dat pokud omylem odeberete člena

3. **Auto-save při rychlém přepínání stránek:**
   - Timeout 1s může být příliš krátký
   - Možná úprava na 2-3s pokud je to rušivé

---

## Checklist před release

- [ ] Všechny test cases provedeny
- [ ] Regresní testy prošly
- [ ] Žádné console errory
- [ ] LocalStorage funguje správně
- [ ] Mobilní zobrazení je funkční
- [ ] Dokumentace aktualizována (README, CHANGELOG)
