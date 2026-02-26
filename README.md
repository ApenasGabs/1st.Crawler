# 🕷️ SimpleCrawl

CLI interativo para criar projetos de web scraping do zero — escolha a engine (SSR/CSR/hybrid) e a arquitetura, como faz com `create-vite`.

## Início rápido

```bash
npm create simplecrawl
```

```
1/3 — Engine de extração (tipo de site):
  ❯ ssr      — HTTP + Cheerio     (sites server-side rendered)
    csr      — Playwright         (sites client-side / SPA)
    hybrid   — Cheerio + Playwright fallback (melhor dos dois)

2/3 — Arquitetura do projeto:
  ❯ 1-modular        — Simples, 1-3 scrapers
    2-ddd-lite       — DDD leve, domínios separados
    3-plugin-based   — Plugins dinâmicos, 6+ scrapers
    4-queue-based    — Filas (Redis/Bull), produção

3/3 — Nome do projeto: my-scraper
```

## Também funciona com

```bash
yarn create simplecrawl
pnpm create simplecrawl
npx create-simplecrawl
```

## Estrutura do repositório

```
├── create-simplecrawl/      # Pacote CLI (npm create simplecrawl)
│   ├── bin/index.mjs        # Entry point
│   ├── template -> ../template
│   └── package.json
├── template/                # Templates de projeto
│   ├── src/
│   │   ├── scrapers/base/   # BaseScraper (Playwright) + BaseHttpScraper (Cheerio)
│   │   ├── pipeline/        # BrowserPool, ParallelExecutor, merge
│   │   ├── domain/types.ts  # ScrapedRecord + RawData (genérico)
│   │   └── examples/architectures/  # 4 arquiteturas prontas
│   └── examples/            # Exemplos standalone
├── ARQUITECTURAS_SCRAPING.md  # Guia comparativo de arquiteturas
└── .github/workflows/       # CI/CD
```

## Documentação

- [Guia de Arquiteturas](ARQUITECTURAS_SCRAPING.md) — comparativo detalhado das 4 arquiteturas, com recomendações por caso de uso
- [Template README](template/README.md) — como usar o template diretamente
- [Variáveis de ambiente](template/docs/ENV_VARS.md) — configuração

## Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Commit (`git commit -m 'feat: minha feature'`)
4. Push (`git push origin feature/minha-feature`)
5. Abra um Pull Request

## Licença

MIT
