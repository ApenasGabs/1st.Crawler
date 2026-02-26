# 🕷️ SimpleCrawl

CLI interativo para criar projetos de web scraping do zero — estilo `create-vite`.  
Ideal para quem está começando com scraping e quer uma base sólida.

## Uso

```bash
# npm
npm create simplecrawl

# yarn
yarn create simplecrawl

# pnpm
pnpm create simplecrawl

# com nome do projeto direto
npm create simplecrawl my-scraper

# flags diretas (pula menus)
npm create simplecrawl -- --engine hybrid --arch 1-modular --dest my-scraper
```

## Fluxo interativo

```
1/3 — Engine de extração (tipo de site):
  ❯ ssr      — HTTP + Cheerio     (sites server-side rendered)
    csr      — Playwright         (sites client-side / SPA)
    hybrid   — Cheerio + Playwright fallback (melhor dos dois)

2/3 — Arquitetura do projeto:
  ❯ 1-modular        — Simples, 1-3 scrapers, fácil de começar
    2-ddd-lite       — DDD leve, domínios separados, escalável
    3-plugin-based   — Plugins dinâmicos, 6+ scrapers
    4-queue-based    — Filas (Redis/Bull), produção larga escala

3/3 — Nome do projeto (padrão: my-scraper):
```

## O que é gerado

```
my-scraper/
├── package.json          # Dependências ajustadas à engine escolhida
├── tsconfig.json
├── README.md             # Customizado com engine + arch
├── docs/
├── examples/
└── src/
    ├── domain/types.ts   # ScrapedRecord + RawData (genérico)
    ├── scrapers/
    │   └── base/         # BaseScraper e/ou BaseHttpScraper
    ├── pipeline/         # BrowserPool, ParallelExecutor, merge
    └── utils/logger.ts
```

## Flags

| Flag | Atalho | Descrição |
|---|---|---|
| `--engine` | `-e` | `ssr`, `csr` ou `hybrid` |
| `--arch` | `-a` | `1-modular`, `2-ddd-lite`, `3-plugin-based`, `4-queue-based` |
| `--dest` | `-d` | Nome da pasta destino |

## Publicação no npm

```bash
cd create-simplecrawl
npm login
npm publish
```

Após publicado, qualquer pessoa pode rodar `npm create simplecrawl`.
