# BroSplit - Rychlá příručka

## 🚀 Začínáme

### První kroky
1. **Přidejte členy** - Jděte do Správy členů a přidejte všechny pravidelné členy (označte jako "core")
2. **Vytvořte menu** - Přidejte běžné položky z vašeho oblíbeného podniku (pivo, čaj, polévka...)
3. **Vytvořte událost** - Když jdete na pub kvíz, vytvořte novou událost

## 📱 Běžné úkony

### Vytvoření události

**S účtenkou (doporučeno):**
1. Nová událost → Vyplňte datum a název
2. Zkontrolujte přítomné (core jsou předvyplněni)
3. Označte kdo zaplatil + zadejte celkovou částku a dýško
4. Zaškrtněte "Mám účtenku"
5. Zadejte produkty z účtenky (10× pivo, 3× polévka...)
6. Vytvořit → Sdílejte link členům

**Bez účtenky:**
1-3. Stejné jako výše
4. NEZAŠKRTÁVEJTE "Mám účtenku"
5. Vytvořit → Sdílejte link

### Zadávání konzumace

1. Otevřete událost (přes link nebo z dashboardu)
2. Vyberte člena v "Přidat/upravit konzumaci"
3. Zaklikejte položky (+ tlačítko)
4. Pokud je vodní dýmka → zaškrtněte ji
5. Uložit
6. Opakujte pro další členy

### Sdílená položka (vodní dýmka)

- Zaškrtněte ji u každého, kdo se zúčastnil
- Cena se automaticky rozdělí (300 Kč / 3 lidé = 100 Kč/os)

### Platby

- Po události postupně zaškrtávejte "Zaplatil" u každého člena
- Platič má automaticky 0 Kč k zaplacení

### Uzavření události

- Když jsou všechny platby vyřízené → "Uzavřít událost"
- Můžete kdykoliv znovu otevřít pro úpravu

## ⚠️ Časté problémy

### "Chybí rozebrání X Kč"
→ Něco není zakliknuté, zkontrolujte konzumaci všech členů

### "Překročeno o X Kč"
→ Někdo zaklikl víc než je na účtence, opravte konzumaci

### Vodní dýmka není rozdělená
→ Aspoň jeden člen se musí přihlásit ke sdílené položce

### Změnila se cena v menu
→ V pořádku! Staré události používají původní cenu

## 💡 Tipy

- **Předvyplňte menu** dopředu, ušetříte čas při události
- **Sdílejte link** všem členům hned po vytvoření události
- **Označte core členy** - budou automaticky předvyplněni
- **Používejte názvy** událostí pro lepší orientaci v historii
- **Uzavírejte události** když jsou vyřešené, přehlednější historie

## 📊 Jak fungují výpočty

```
Člen platil:     500 Kč konzumace + 50 Kč dýško = 550 Kč
Platič (pokud platil celou účtenku): 0 Kč k zaplacení
```

**Dýško se rozdělí rovnoměrně:**
```
200 Kč dýško / 4 členové = 50 Kč na osobu
```

**Sdílená položka:**
```
300 Kč vodní dýmka / 3 kuřáci = 100 Kč na osobu
```

## 🔒 Bezpečnost a data

- Data jsou uložena **pouze ve vašem prohlížeči** (LocalStorage)
- **Žádná synchronizace** mezi zařízeními
- Kdokoliv s linkem může **upravovat** událost
- Pro zálohu → zkopírujte data z Developer Console (viz README)

## 🆘 Potřebujete pomoc?

- Přečtěte si kompletní README.md
- Prostudujte TESTING.md pro detailní návody
- Kontaktujte správce aplikace
