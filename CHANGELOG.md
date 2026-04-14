# Changelog

Všechny významné změny v projektu Tácek budou zdokumentovány v tomto souboru.

Formát vychází z [Keep a Changelog](https://keepachangelog.com/cs/1.0.0/),
a projekt dodržuje [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-04-14

### 🍺 Rebranding na Tácek
- ✅ **Přejmenování aplikace** - z BroSplit na Tácek
  - Nový název: "Tácek - Kde přátelství končí a dluhy začínají"
  - Aktualizace package.json, index.html, README.md
  - Změna LocalStorage klíčů (`tacek_*` místo `brosplit_*`)
  - Aktualizace všech dokumentačních souborů

### 😈 Centralizace textů se sarkasmem
- ✅ **Centralizovaný soubor textů** - `src/constants/texts.ts`
  - Všechny texty aplikace na jednom místě
  - Zdravá dávka sarkasmu a ironie v každém textu
  - Helper funkce `formatText()` pro parametrizované texty
  - Strukturované kategorie: loading, placeholders, buttons, notifications, errors, warnings, labels, easterEggs, helpTexts
- ✅ **LoadingBar komponenta** - `src/components/LoadingBar.tsx`
  - Animovaný progress bar (0-90%, dokončí se při načtení)
  - Rotující sarkastické zprávy (každých 1.5s)
  - Fade-in/out animace
  - Podpora custom message
- ✅ **Refaktoring komponent** - Použití TEXTS ve všech stránkách
  - AppContext.tsx - LoadingBar integrace
  - Dashboard.tsx - Titulky, subtitle, buttons, empty states
  - ManageMembers.tsx - Placeholders, labels, notifications, warnings
  - ManageMenu.tsx - Kategorie, validace
  - Ostatní stránky - Postupná integrace

### Příklady sarkastických textů
- 💬 "Další večer kde Gaba 'zapomněl' peněženku" (placeholder název události)
- 💬 "Jděte konečně ven" (žádné události)
- 💬 "V roce 2026. Seriously?" (chybí Revolut)
- 💬 "Zkopírovat a poslat do prázdna" (copy summary)
- 💬 "Počítám kolikrát už někdo slíbil že zítra zaplatí..." (loading message)

## [1.1.0] - 2026-04-14

### Přidáno
- ✅ **Auto-save draft události** - průběžné ukládání rozpracované události do localStorage
  - Dialog "Máte rozpracovanou událost" při návratu na formulář
  - Možnost pokračovat nebo začít novou událost
  - Automatické uložení po 1 sekundě nečinnosti
- ✅ **Editace existujících událostí** - možnost upravit již vytvořenou událost
  - Tlačítko "Upravit" v detailu události
  - Úprava základních údajů (datum, název, členové, platič, částky)
  - Úprava produktů z účtenky
  - Varování při editaci uzavřených událostí
  - Automatický přepočet všech částek po změně
  - Route `/event/:id/edit`
- ✅ **Detailní zobrazení sdílených položek** - vylepšený přehled konzumace
  - Rozdělení na běžné položky, sdílené položky a dýško
  - Zobrazení poměru účasti na sdílených položkách (např. "Dýmka 1/3")
  - Barevné odlišení typů položek (běžné/sdílené/dýško)
  - Přehledný součet na konci

### Změněno
- Vylepšené UI detailu události s přehlednějším zobrazením konzumace
- Tlačítko "Uzavřít událost" zkráceno na "Uzavřít" kvůli prostoru pro tlačítko "Upravit"

### Technické
- Nový hook `useEventDraft` pro správu draftu
- Nový interface `EventDraft` v types/models.ts
- Nová komponenta `EditEvent.tsx`
- Rozšířený routing o `/event/:id/edit`

## [1.0.0] - 2026-04-14

### Přidáno
- ✅ Správa členů skupiny (core vs. náhradníci)
- ✅ Správa jídelního lístku s kategoriemi
- ✅ Vytváření událostí (varianta A s účtenkou, varianta B bez účtenky)
- ✅ Zadávání konzumace s live přepočty
- ✅ Sdílené položky (vodní dýmka) s rovnoměrným rozdělením
- ✅ Proporcionální rozdělení dýška
- ✅ Evidence plateb s checkboxy
- ✅ Historie událostí
- ✅ Uzavírání/otevírání událostí
- ✅ Sdílitelné linky na události
- ✅ Validace a varování při nesouladu s účtenkou
- ✅ Responzivní mobilní design
- ✅ LocalStorage persistence
- ✅ Repository pattern pro budoucí backend

### Technické
- React 18 + TypeScript
- TailwindCSS pro styling
- React Router v6
- Vite build tool
- date-fns pro práci s datem

## [Unreleased]

### Plánované funkce pro budoucí verze
- Backend API s synchronizací
- Autentizace a přístupová práva
- Více podniků s různými jídelními lístky
- Statistiky a reporty
- QR kódy pro platby
- Revolut API integrace
- Email/push notifikace
- Export do PDF/Excel
- Archivace starých událostí
