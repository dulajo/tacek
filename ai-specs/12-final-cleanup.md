# Finální cleanup

## Overview
Závěrečný úklid po všech refaktorovacích krocích – unused imports, konzistence, ověření že žádný soubor nepřekračuje 400 řádků.

## Goals
- Čistý, konzistentní kód
- Žádné unused imports/variables
- Žádný soubor > 400 řádků

## Requirements

### Functional Requirements
- [ ] Projít všechny soubory a odstranit unused imports
- [ ] Ověřit že žádný soubor v `src/` nepřekračuje 400 řádků
- [ ] Ověřit konzistentní pojmenování (camelCase pro funkce, PascalCase pro komponenty)
- [ ] Ověřit že všechny nové komponenty mají `displayName` (pro React DevTools)
- [ ] Spustit `npm run lint` a opravit všechny warnings
- [ ] Spustit `npm run build:check` jako finální ověření
- [ ] Spustit `npm test` jako finální ověření

## Acceptance Criteria
1. `npm run build:check` projde bez chyb
2. `npm run lint` projde bez warnings
3. `npm test` projde – všechny testy zelené
4. Žádný soubor v `src/` delší než 400 řádků
5. Žádné unused imports (ověřit TypeScript strict mode)
6. Manuální smoke test celé aplikace: dashboard → vytvořit událost → přidat konzumaci → zkopírovat summary → uzavřít událost → editovat → smazat

## Out of Scope
- Nová funkcionalita
- Změny designu
