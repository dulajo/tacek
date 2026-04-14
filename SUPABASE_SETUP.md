# Supabase Setup Guide pro BroSplit

## 🚀 Rychlý start

### 1. Vytvoření Supabase projektu

1. Přejděte na [supabase.com](https://supabase.com)
2. Přihlaste se nebo vytvořte účet (GitHub/Google)
3. Klikněte **New Project**
4. Vyplňte:
   - **Name:** `brosplit` (nebo dle preference)
   - **Database Password:** Silné heslo (uložte si ho)
   - **Region:** Vyberte nejbližší (např. `eu-central-1` pro Evropu)
5. Klikněte **Create new project**
6. Počkejte ~2 minuty na vytvoření projektu

### 2. Zjištění credentials

Po vytvoření projektu:

1. V levém menu klikněte na **Settings** (ikona ozubeného kola)
2. Klikněte na **API**
3. Najděte a zkopírujte:
   - **Project URL** (např. `https://xxxxx.supabase.co`)
   - **anon/public key** (dlouhý řetězec začínající `eyJ...`)

### 3. Spuštění SQL migrace

1. V levém menu klikněte na **SQL Editor**
2. Klikněte **New query**
3. Otevřete soubor `migrations.sql` v projektu
4. Zkopírujte celý obsah souboru
5. Vložte do SQL Editoru
6. Klikněte **Run** (nebo Ctrl/Cmd + Enter)
7. Měli byste vidět: **Success. No rows returned**

### 4. Ověření tabulek

1. V levém menu klikněte na **Table Editor**
2. Měli byste vidět 8 tabulek:
   - ✅ `members`
   - ✅ `menu_items`
   - ✅ `events`
   - ✅ `event_members`
   - ✅ `event_preset_items`
   - ✅ `member_consumptions`
   - ✅ `consumption_items`
   - ✅ `consumption_shared_items`

### 5. Konfigurace aplikace

1. Otevřete soubor `src/lib/supabase.ts`
2. Nahraďte credentials:

```typescript
const supabaseUrl = 'VÁŠE_PROJECT_URL'
const supabaseKey = 'VÁŠ_ANON_PUBLIC_KEY'
```

3. Uložte soubor

### 6. Instalace a spuštění

```bash
# Instalace závislostí (včetně @supabase/supabase-js)
npm install

# Spuštění dev serveru
npm run dev
```

Aplikace běží na `http://localhost:5173`

---

## 🔄 Migrace dat z LocalStorage

Pokud máte existující data v LocalStorage:

### Metoda 1: Přes browser console

1. Otevřete aplikaci v prohlížeči
2. Otevřete Developer Tools (F12)
3. Klikněte na **Console**
4. Zadejte:

```javascript
window.migrateToSupabase()
```

5. Sledujte progress v console
6. Po dokončení by mělo být: **🎉 Migration complete!**

### Metoda 2: Přes React komponentu (dočasné tlačítko)

Pokud preferujete UI tlačítko, přidejte do `Dashboard.tsx`:

```typescript
import { migrateLocalStorageToSupabase } from '../utils/migrateToSupabase';

// Někam do JSX:
<button 
  onClick={() => migrateLocalStorageToSupabase()} 
  className="btn btn-secondary"
>
  🔄 Migrovat data do Supabase
</button>
```

**POZOR:** Po migraci tlačítko smažte!

---

## 🔍 Troubleshooting

### Chyba: "Invalid API key"

- Zkontrolujte že jste zkopírovali **anon/public** key, ne **service_role** key
- Ujistěte se že není žádný whitespace před/za klíčem

### Chyba: "relation does not exist"

- SQL migrace nebyla úspěšně spuštěna
- Zkuste migraci znovu spustit
- Zkontrolujte v Table Editoru že tabulky existují

### Chyba: "Row Level Security policy violation"

- RLS policies by měly být nastaveny na "allow all"
- V SQL Editoru spusťte znovu část s `CREATE POLICY`

### Data se neuloží

- Otevřete Developer Tools → Network
- Zkontrolujte že požadavky na Supabase jsou úspěšné (status 200/201)
- Zkontrolujte Console pro error messages

### Migrace selže s "duplicate key"

- Data již existují v Supabase
- To je OK - migrace přeskočí duplicity
- Pokud chcete začít znovu, smažte data:

```sql
-- POZOR: Smaže všechna data!
DELETE FROM consumption_shared_items;
DELETE FROM consumption_items;
DELETE FROM member_consumptions;
DELETE FROM event_preset_items;
DELETE FROM event_members;
DELETE FROM events;
DELETE FROM menu_items;
DELETE FROM members;
```

---

## 📊 Monitoring

### Sledování využití

1. V Supabase dashboardu klikněte **Reports**
2. Sledujte:
   - **Database size** (Free tier: 500 MB)
   - **API requests** (Free tier: unlimited)
   - **Bandwidth** (Free tier: 5 GB)

### Záloha databáze

1. Klikněte **Database** → **Backups**
2. Automatické zálohy jsou prováděny denně (Free tier: 7 dní historie)
3. Pro manuální zálohu:
   - Klikněte **Download backup**
   - Uložte `.sql` soubor

### Real-time sledování

V Table Editoru můžete vidět data v reálném čase:

1. Klikněte na tabulku (např. `events`)
2. Data se automaticky aktualizují při změnách
3. Použijte filters pro hledání

---

## 🔐 Bezpečnost

### Aktuální nastavení

- **RLS (Row Level Security):** Povoleno
- **Policies:** "Allow all" - žádná autentizace
- **Vhodné pro:** Privátní skupinu s důvěrou

### Pro budoucí zlepšení

Pokud chcete přidat autentizaci:

1. Přidat Supabase Auth (email/password nebo OAuth)
2. Upravit policies:

```sql
-- Příklad: Pouze přihlášení uživatelé mohou číst
CREATE POLICY "Allow authenticated read" 
ON members FOR SELECT 
USING (auth.role() = 'authenticated');
```

3. Přidat login page do aplikace
4. Používat `supabase.auth.signIn()`

---

## 💡 Tipy

1. **Development:** Použijte separátní Supabase projekt pro vývoj a produkci
2. **Environment variables:** V produkci používejte `.env` pro credentials
3. **Monitoring:** Sledujte Reports pro včasnou detekci problémů
4. **Backups:** Pravidelně stahujte zálohy (automatické jsou jen 7 dní)
5. **Indexes:** Pro velké databáze přidejte indexy pro rychlejší queries

---

## 📞 Podpora

- **Supabase Docs:** [https://supabase.com/docs](https://supabase.com/docs)
- **Supabase Discord:** [https://discord.supabase.com](https://discord.supabase.com)
- **BroSplit Issues:** Kontaktujte správce aplikace
