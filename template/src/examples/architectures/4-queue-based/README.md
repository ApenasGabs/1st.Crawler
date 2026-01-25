# 4. Arquitetura Queue-Based

**Conceito**: Scrapers como jobs em fila (Redis/Bull), com retry automático e resiliência.

## Quando usar
- Produção em larga escala (10+ scrapers)
- Precisa retry automático
- Dados críticos/importante não perder
- Histórico de execução necessário

## Estrutura

```
├── src/
│   ├── queue/
│   │   ├── QueueManager.ts      # Gerenciador Bull
│   │   ├── JobProcessor.ts      # Processador de jobs
│   │   └── JobDefinition.ts
│   ├── jobs/
│   │   ├── QuoteJob.ts
│   │   ├── BookJob.ts
│   │   └── JobFactory.ts
│   ├── persistence/
│   │   └── JobStorage.ts        # Salva histórico
│   └── main.ts
├── docker-compose.yml           # Redis local
└── package.json
```

## Vantagens
✅ Retry automático
✅ Histórico de execução
✅ Distribuído (multi-worker)
✅ Escalabilidade alta
✅ Resiliência a crashes

## Desvantagens
❌ Requer Redis
❌ Bem mais complexo
❌ Overhead operacional
❌ Precisa de monitoramento

## Pré-requisitos

```bash
# Subir Redis local
docker-compose up -d

# Instalar dependências
npm install
```

## Como rodar

```bash
npx tsx main.ts
```

## Adicionando novo job

1. Crie `src/jobs/MyJob.ts`
2. Implemente `IJob`
3. Registre em `JobFactory`
4. Queue automáticamente processa

Recomendado para produção.
