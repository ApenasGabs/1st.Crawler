# Simple Crawler Template (Playwright + TypeScript)

Template para scrapers com arquitetura Modular + DDD Lite + Paralelização interna, com suporte a estratégia híbrida (Playwright para CSR e Cheerio para SSR), otimizado para pipelines de até 6h.

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

# Modo interativo
npm run scaffold:architecture

> Dica: use as setas ↑/↓ para selecionar a arquitetura
```

## 📁 Estrutura

```
src/
├── domain/                  # Tipos/entidades
├── scrapers/
│   ├── base/
│   │   ├── BaseScraper.ts       # Base Playwright (CSR)
│   │   └── BaseHttpScraper.ts   # Base fetch+cheerio (SSR)
│   ├── siteA/               # Exemplo scraper CSR (Playwright)
│   ├── siteB/               # Exemplo scraper CSR (Playwright)
│   ├── siteC/               # Exemplo scraper SSR (Cheerio)
│   └── registry.ts          # Registro de scrapers (HTTP + Browser)
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

# Exemplo SSR com Cheerio (sem browser)
npm run example:ssr
```

> Nota: Os exemplos usam sites públicos de treino (ex.: Quotes to Scrape), apropriados para demonstração de scraping.

## 🛠️ Requisitos

- Node.js 20+
- Para scrapers CSR: instalar browsers do Playwright (CI ou local):

```bash
npx playwright install --with-deps chromium
```

- Para scrapers SSR: nenhuma dependência extra (usa `fetch` + `cheerio`).

## 🧩 Adicionando um novo scraper

### Scraper SSR (Cheerio — para sites server-side rendered)

1. Crie `src/scrapers/<site>/Site<S>Scraper.ts` estendendo `BaseHttpScraper`
2. Implemente `scrape($)` usando seletores CSS do cheerio
3. Exporte no `httpScraperRegistry` em `src/scrapers/registry.ts`

### Scraper CSR (Playwright — para SPAs / JS-heavy)

1. Crie `src/scrapers/<site>/Site<S>Scraper.ts` estendendo `BaseScraper`
2. Implemente `scrape(page)` usando a API do Playwright
3. Exporte no `browserScraperRegistry` em `src/scrapers/registry.ts`

> **Regra prática:** tente SSR primeiro (mais rápido e leve). Use Playwright apenas quando o HTML da página não contém os dados no `view-source`.

## 🏗️ Scaffold: gerando template por engine + arquitetura

O scaffold agora pergunta **duas coisas**, nessa ordem:

1. **Engine de extração** — `ssr` (Cheerio), `csr` (Playwright) ou `hybrid` (ambas)
2. **Arquitetura do projeto** — `1-modular`, `2-ddd-lite`, `3-plugin-based`, `4-queue-based`

```bash
# Modo interativo (recomendado)
npm run scaffold:architecture

# Direto por flags
npm run scaffold:architecture -- --engine hybrid --arch 1-modular --dest meu-projeto
```

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
