# 2. Arquitetura DDD Lite + Paralelização Interna

**Conceito**: Domínios separados com orquestração forte, scrapers rodam em paralelo internamente.

## Quando usar
- Dados com regras de negócio complexas
- Transformações específicas por fonte
- Precisa testar domínios isoladamente

## Estrutura

```
├── src/
│   ├── domain/                    # **Domínio específico**
│   │   ├── entities/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── types.ts
│   ├── adapters/                  # **Adaptadores (scrapers)**
│   │   ├── QuoteAdapter.ts
│   │   ├── BookAdapter.ts
│   │   └── AdapterInterface.ts
│   ├── application/               # **Orquestração**
│   │   ├── ScraperService.ts
│   │   ├── MergeService.ts
│   │   └── PipelineOrchestrator.ts
│   └── main.ts
└── package.json
```

## Vantagens
✅ Regras de negócio centralizadas
✅ Adapters podem variar sem afetar domínio
✅ Fácil de testar (DDD)
✅ Escalável para múltiplos adapters
✅ Adapter SSR com `cheerio` sem impactar domínio

## Desvantagens
❌ Mais complexo inicialmente
❌ Mais arquivos/pastas
❌ Overhead de camadas

## Como rodar

```bash
npm install
npx tsx main.ts
```

## Adicionando novo adapter

1. Implemente `AdapterInterface`
2. Registre em `ScraperService`
3. Domínio continua intacto

Perfeito para manter dados coerentes mesmo com múltiplas fontes.

## Opção SSR com Cheerio

- Crie um adapter HTTP (`SsrCheerioAdapter`) para páginas SSR.
- Mantenha fallback para adapter Playwright quando necessário.
- Centralize a decisão de engine na camada de aplicação.
