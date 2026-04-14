# BroSplit - Development Notes

## Rychlé spuštění

```bash
# Instalace
npm install

# Development server
npm run dev
# → http://localhost:5173

# Build pro produkci
npm run build

# Preview produkční verze
npm run preview
```

## Struktura dat v LocalStorage

```javascript
// Klíče v localStorage
brosplit_members       // Member[]
brosplit_menu_items    // MenuItem[]
brosplit_events        // Event[]
brosplit_consumptions  // MemberConsumption[]

// Příklad načtení
const members = JSON.parse(localStorage.getItem('brosplit_members') || '[]')

// Příklad uložení
localStorage.setItem('brosplit_members', JSON.stringify(members))
```

## Testovací data

Pro rychlé naplnění testovacími daty:

```bash
# V browser console (F12)
# Zkopírujte a vložte obsah souboru seed-test-data.js
```

Nebo použijte browser DevTools:
1. F12 → Application → Local Storage
2. Vytvořte klíče manuálně

## Routing

```
/                    → Dashboard
/members             → Správa členů
/menu                → Správa jídelního lístku
/event/new           → Vytvoření události
/event/:eventId      → Detail události
```

## Business logika

### Výpočet částky člena

```typescript
// Vlastní konzumace
const consumption = sum(items.map(i => price × quantity))

// Sdílené položky
const shared = sum(sharedItems.map(i => price / participantCount))

// Podíl na dýšku
const tipShare = totalTip / presentMemberCount

// Celková částka
const total = consumption + shared + tipShare

// Pokud je člen platič → total = 0
```

### Validace události

**Varianta A (s účtenkou):**
```typescript
const presetTotal = sum(presetItems)
const consumedTotal = sum(allConsumptions)
const difference = presetTotal - consumedTotal

if (difference > 0) → "Chybí X Kč"
if (difference < 0) → "Překročeno o X Kč"
```

**Varianta B (bez účtenky):**
```typescript
const expectedTotal = totalAmount - tip
const consumedTotal = sum(allConsumptions)
const difference = expectedTotal - consumedTotal
```

## Přidání nové funkce

### 1. Přidání nového pole do modelu

```typescript
// 1. Upravit interface v src/types/models.ts
interface Member {
  id: string;
  name: string;
  isCore: boolean;
  email?: string; // NOVÉ POLE
}

// 2. Upravit formuláře (ManageMembers.tsx)
// 3. Data se uloží automaticky přes repository
```

### 2. Přidání nové stránky

```typescript
// 1. Vytvořit src/pages/NewPage.tsx
export default function NewPage() {
  return <div>New Page</div>
}

// 2. Přidat route v src/App.tsx
<Route path="/new" element={<NewPage />} />

// 3. Přidat link v Dashboard.tsx
<Link to="/new">New Page</Link>
```

### 3. Přidání nové business logiky

```typescript
// Přidat funkci do src/services/calculationService.ts
export function calculateNewMetric(...) {
  // implementace
}

// Použít v komponentě
import { calculateNewMetric } from '../services/calculationService';
const result = calculateNewMetric(...);
```

## Změna na Backend API

Pro přechod z LocalStorage na backend:

```typescript
// 1. Vytvořit novou implementaci
class BackendRepository implements IDataRepository {
  async getMembers(): Promise<Member[]> {
    const response = await fetch('/api/members');
    return response.json();
  }
  // ... další metody
}

// 2. Nahradit v AppContext.tsx
const [repository] = useState<IDataRepository>(
  () => new BackendRepository() // místo LocalStorageRepository
);

// 3. Veškerá business logika zůstane beze změny!
```

## Debugging

### LocalStorage inspector

```javascript
// Browser console
// Zobrazit všechna data
Object.keys(localStorage)
  .filter(k => k.startsWith('brosplit_'))
  .forEach(k => console.log(k, JSON.parse(localStorage[k])))

// Vymazat všechna data
Object.keys(localStorage)
  .filter(k => k.startsWith('brosplit_'))
  .forEach(k => localStorage.removeItem(k))
```

### React DevTools

1. Nainstalujte React DevTools extension
2. F12 → Components tab
3. Zkontrolujte state v AppContext

## Performance optimization

### Lazy loading routes

```typescript
// Místo import na začátku
import Dashboard from './pages/Dashboard';

// Použijte lazy import
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Obalte <Suspense>
<Suspense fallback={<Loading />}>
  <Routes>...</Routes>
</Suspense>
```

### Memoizace výpočtů

```typescript
import { useMemo } from 'react';

const summary = useMemo(
  () => calculateEventSummary(event, consumptions, menuItems, members),
  [event, consumptions, menuItems, members]
);
```

## Styling

### Custom utility class

```css
/* src/index.css */
@layer components {
  .my-custom-class {
    @apply px-4 py-2 bg-blue-500 text-white;
  }
}
```

### Responsive design

```tsx
// Tailwind breakpoints
<div className="
  grid 
  grid-cols-1          {/* mobile */}
  sm:grid-cols-2       {/* ≥640px */}
  md:grid-cols-3       {/* ≥768px */}
  lg:grid-cols-4       {/* ≥1024px */}
">
```

## Common issues

### Port already in use
```bash
# Změnit port v package.json
"dev": "vite --port 3000"
```

### TypeScript errors
```bash
# Regenerovat types
npm run build
```

### LocalStorage full
```javascript
// Max 5-10 MB per domain
// Vyčistit staré události nebo exportovat data
```

## Git workflow

```bash
# Feature branch
git checkout -b feature/new-feature
git add .
git commit -m "feat: přidání nové funkce"
git push origin feature/new-feature

# Merge request na GitLab
# Po review → merge do main
```

## Continuous Integration (budoucí)

```yaml
# .gitlab-ci.yml (příklad)
stages:
  - test
  - build
  - deploy

test:
  script:
    - npm install
    - npm run lint

build:
  script:
    - npm run build
  artifacts:
    paths:
      - dist/

deploy:
  script:
    - rsync -avz dist/ server:/var/www/brosplit/
  only:
    - main
```

## Resources

- [React docs](https://react.dev)
- [TypeScript docs](https://www.typescriptlang.org/docs)
- [TailwindCSS docs](https://tailwindcss.com/docs)
- [Vite docs](https://vitejs.dev)
- [React Router docs](https://reactrouter.com)
