# Contributing to BroSplit

Děkujeme za váš zájem o přispění do projektu BroSplit!

## 🚀 Jak začít

1. **Fork** repository
2. **Clone** na lokální počítač
3. **Vytvořte branch** pro vaši změnu
4. **Implementujte** změnu
5. **Testujte** funkčnost
6. **Commitněte** s popisnou zprávou
7. **Push** do vašeho forku
8. **Vytvořte Merge Request**

## 📝 Commit messages

Používáme [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: přidání nové funkce
fix: oprava chyby
docs: úprava dokumentace
style: formátování kódu
refactor: refaktoring bez změny funkčnosti
test: přidání testů
chore: ostatní změny (build, CI...)
```

Příklady:
```
feat: přidání podpory pro více podniků
fix: oprava výpočtu dýška při 0 členech
docs: aktualizace README s deployment instrukcemi
refactor: extrakce výpočtů do service
```

## 🏗️ Code Style

### TypeScript
- Používejte TypeScript pro všechny nové soubory
- Vyhněte se `any` typům
- Preferujte interface před type aliases
- Používejte arrow functions

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

const getUser = async (id: string): Promise<User> => {
  // ...
}

// ❌ Bad
type User = any;

function getUser(id) {
  // ...
}
```

### React Components
- Používejte functional components
- Preferujte named exports
- Destrukturujte props
- Používejte TypeScript pro props

```typescript
// ✅ Good
interface DashboardProps {
  userId: string;
}

export default function Dashboard({ userId }: DashboardProps) {
  // ...
}

// ❌ Bad
export default function Dashboard(props) {
  const userId = props.userId;
  // ...
}
```

### Styling
- Používejte TailwindCSS utility classes
- Vytvářejte custom classes v `@layer components`
- Responzivní design first (mobile-first)

```tsx
// ✅ Good
<button className="btn btn-primary w-full sm:w-auto">
  Click me
</button>

// ❌ Bad
<button style={{ padding: '8px', background: 'blue' }}>
  Click me
</button>
```

## 🧪 Testing

Před submitem merge requestu:

1. **Manuální testování:**
   - Vyzkoušejte všechny ovlivněné funkce
   - Testujte na mobilu i desktopu
   - Zkontrolujte edge cases

2. **Code review checklist:**
   - [ ] Žádné console.log v produkčním kódu
   - [ ] Žádné TypeScript `any` typy
   - [ ] Responzivní design funguje
   - [ ] Žádné hardcoded hodnoty (API keys, URLs...)
   - [ ] Kód je čitelný a dokumentovaný

## 📁 Struktura projektu

```
src/
├── types/          # TypeScript definice
├── repositories/   # Data layer
├── services/       # Business logika
├── contexts/       # React Context
├── pages/          # Hlavní stránky
├── components/     # Znovupoužitelné komponenty (budoucí)
└── utils/          # Utility funkce (budoucí)
```

## 🔄 Pull Request Process

1. **Popisný název:** `feat: přidání statistik útrat`
2. **Detailní popis:**
   - Co se mění a proč
   - Jak to testovat
   - Screenshots (pokud UI změny)
3. **Linked issues:** Odkaz na related issue
4. **Review:** Počkejte na code review
5. **CI/CD:** Ujistěte se, že všechny checks prošly

## 🐛 Bug Reports

Při nahlášení bugu uveďte:

1. **Popis problému:** Co se děje
2. **Kroky k reprodukci:** 1. 2. 3.
3. **Očekávané chování:** Co by mělo nastat
4. **Screenshots:** Pokud je to relevantní
5. **Prostředí:**
   - Browser: Chrome 120
   - OS: macOS 14
   - Verze aplikace: 1.0.0

## 💡 Feature Requests

Při návrhu nové funkce uveďte:

1. **Use case:** Proč je funkce potřeba
2. **Popis:** Jak by měla fungovat
3. **Mockupy:** Návrh UI (volitelné)
4. **Priorita:** Low/Medium/High

## ❓ Questions?

- Přečtěte si README.md a DEVELOPMENT.md
- Zkontrolujte existující issues
- Vytvořte nový issue s otázkou

---

Děkujeme za váš přínos! 🎉
