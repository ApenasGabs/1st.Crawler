# 1. Arquitetura Modular

**Conceito**: Scrapers independentes, coordenação simples via orquestrador.

## Quando usar
- Templates genéricos
- Projetos pequenos/médios
- Scrapers sem muita interação entre si

## Estrutura

```
├── src/
│   ├── utils/logger.ts          # Logger compartilhado
│   ├── domain/types.ts          # Tipos neutros
│   ├── scrapers/
│   │   ├── base/BaseScraper.ts  # Contrato abstrato
│   │   ├── quoteScraper.ts      # Exemplo 1
│   │   ├── bookScraper.ts       # Exemplo 2
│   │   └── registry.ts          # Registro
│   ├── pipeline/
│   │   ├── BrowserPool.ts       # Reuso contextos
│   │   ├── ParallelExecutor.ts  # Paralelização
│   │   └── merge-validate.ts    # Merge final
│   └── main.ts                  # Orquestrador
└── package.json
```

## Vantagens
✅ Simples de entender e modificar
✅ Fácil adicionar novo scraper
✅ Bom para prototipagem

## Desvantagens
❌ Sem separação clara de domínios
❌ Lógica compartilhada pode crescer demais
❌ Difícil de testar partes específicas

## Como rodar

```bash
npm install
npm run scrape:parallel
npm run merge:validate
```

## Adicionando novo scraper

1. Crie `src/scrapers/myScraper.ts` estendendo `BaseScraper`
2. Exporte em `src/scrapers/registry.ts`
3. Configure timeout e URL em `registry.ts`

Pronto! A orquestração automática pickup seu novo scraper.
