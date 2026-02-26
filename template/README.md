# 1st Crawler Template (Playwright + TypeScript)

Template para scrapers com arquitetura Modular + DDD Lite + Paralelização interna, otimizado para pipelines de até 6h.

## 🚀 Scripts

```bash
# Rodar todos scrapers em paralelo
npm run scrape:parallel

# Rodar scraper individual
npm run scrape:siteA
npm run scrape:siteB

# Merge + validação (gera data/imoveis.json)
npm run merge:validate

# Gerar um novo template baseado em arquitetura
npm run scaffold:architecture -- --arch 1-modular --dest new-template

# Modo interativo (estilo vite)
npm run scaffold:architecture

> Dica: use as setas ↑/↓ para selecionar a arquitetura
```

## 📁 Estrutura

```
src/
├── domain/                  # Tipos/entidades
├── scrapers/
│   ├── base/                # BaseScraper
│   ├── siteA/               # Exemplo scraper A
│   ├── siteB/               # Exemplo scraper B
│   └── registry.ts          # Registro de scrapers
├── pipeline/
│   ├── BrowserPool.ts       # Reuso de browser/contexts
│   ├── ParallelExecutor.ts  # Execução paralela com timeout
│   └── merge-and-validate.ts
└── utils/logger.ts
```

## 🧪 Exemplos

```bash
# Exemplo local sem Playwright
npx tsx examples/local-html-scrape.ts

# Exemplo Playwright básico (Quotes to Scrape)
npx tsx examples/playwright-basic.ts
```

> Nota: Os exemplos usam sites públicos de treino (ex.: Quotes to Scrape), apropriados para demonstração de scraping.

## 🛠️ Requisitos

- Node.js 20+
- Instalar browsers do Playwright (CI ou local):

```bash
npx playwright install --with-deps chromium
```

## 🧩 Adicionando um novo scraper

1. Crie `src/scrapers/<site>/Site<S>Scraper.ts` estendendo `BaseScraper`
2. Exporte no `src/scrapers/registry.ts`
3. Ajuste configs de timeout e user-agent conforme necessário

## ⚙️ CI (exemplo de job único)

```yaml
name: Scrape All
on:
  schedule:
    - cron: '0 */6 * * *'
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    timeout-minutes: 360
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run scrape:parallel
      - run: npm run merge:validate
      - run: |
          git config user.name "bot"
          git config user.email "bot@example.com"
          git add data/
          git commit -m "update: scrape data"
          git push
```
