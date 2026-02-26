# Arquiteturas para Web Scraping (Playwright + Cheerio)

Um guia comparativo de arquiteturas para construir scrapers robustos, escaláveis e mantíveis.

## 🌐 Estratégias de Renderização (CSR vs SSR)

Antes de escolher arquitetura, escolha o **motor de extração por tipo de site**:

| Tipo de site | Sinal comum | Estratégia recomendada | Stack sugerida |
|---|---|---|---|
| **SSR/estático** | HTML já contém os dados no `view-source` | Requisição HTTP + parse de HTML | `fetch` + `cheerio` |
| **CSR/SPA** | HTML inicial vazio e dados após JS | Automação de browser | `playwright` |
| **Híbrido** | Parte no HTML, parte via API/JS | Tentar SSR primeiro, fallback browser | `cheerio` + `playwright` |

### Regra prática

- Comece com `cheerio` para páginas SSR (mais rápido e barato).
- Use `playwright` apenas quando o conteúdo depender de JavaScript, login complexo, anti-bot visual ou interação de UI.
- Em pipelines longos, priorize o modelo híbrido: **HTTP-first, browser-fallback**.

## 📊 Análise do Projeto "QueroDADOS"


### Problemas Identificados

O projeto `querodados` apresenta boas características, mas com alguns desafios:

**✅ Pontos Fortes:**
- Scraper específico por portal (OLX, ZAP)
- GitHub Actions para automação
- Documentação básica
- Configurações por portal

**❌ Pontos Fracos:**
- Entry point único (`index.js`) com lógica if/else
- Scrapers não compartilham estrutura comum
- Sem validação de dados centralizada
- Sem sistema de retry/fallback
- Sem tipagem TypeScript
- Sem tratamento robusto de erros
- Sem logging estruturado
- Dados salvos mas sem pipeline clara
- Sem testes unitários/E2E
- Estrutura cresce desordenadamente com novos scrapers

---

## 🏗️ Arquitetura 1: Modular Simples (Recomendado para começar)

Ideal para 1-3 scrapers simples com requisitos básicos.

```
scrapers/
├── base/
│   ├── BaseScraper.ts          # Classe abstrata
│   └── types.ts                 # Tipos compartilhados
├── olx/
│   ├── OlxScraper.ts
│   ├── selectors.ts
│   └── mapper.ts
├── zap/
│   ├── ZapScraper.ts
│   ├── selectors.ts
│   └── mapper.ts
└── index.ts                     # Factory/Router

utils/
├── logger.ts                    # Logging estruturado
├── validator.ts                 # Validação de dados
├── retry.ts                     # Retry logic
└── storage.ts                   # Persistência

config/
├── index.ts                     # Config centralizada
├── scrapers.ts                  # Config por scraper
└── env.ts                       # Variáveis de ambiente

main.ts                          # Entry point limpo
```

**Pros:**
- ✅ Simples de entender e começar
- ✅ Fácil adicionar novo scraper
- ✅ Código reutilizável com BaseScraper
- ✅ Configuração centralizada

**Contras:**
- ❌ Cresce mal com muitos scrapers (10+)
- ❌ Sem separação por domínio
- ❌ Difícil escalar para microserviços

**Quando usar:**
- Projeto novo com 1-3 scrapers
- Prototipagem rápida
- Time pequeno

**Opção SSR (Cheerio):**
- Crie `BaseHttpScraper` paralela à `BaseScraper` de Playwright.
- Para portais SSR, implemente scraper com `fetch` + `cheerio` para reduzir custo e tempo.
- Mantenha o mesmo contrato de saída para o pipeline de merge/validação.

---

## 🏗️ Arquitetura 2: Domain-Driven Design (DDD)

Ideal para 5+ scrapers ou domínios diferentes.

```
src/
├── domains/                     # Contextos por domínio
│   ├── imobiliario/
│   │   ├── application/
│   │   │   ├── ScrapeImovelUseCase.ts
│   │   │   └── ProcessImovelUseCase.ts
│   │   ├── domain/
│   │   │   ├── Imovel.ts       # Entity
│   │   │   ├── ImovelRepository.ts
│   │   │   └── events/
│   │   ├── infrastructure/
│   │   │   ├── OlxScraper.ts
│   │   │   ├── ZapScraper.ts
│   │   │   └── FileStorage.ts
│   │   └── http/               # Controllers
│   ├── veiculo/
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   └── ...outros domínios
├── shared/
│   ├── domain/
│   │   ├── Result.ts
│   │   └── DomainEvent.ts
│   ├── infrastructure/
│   │   ├── Logger.ts
│   │   └── Config.ts
│   └── http/
│       └── StatusController.ts
├── main.ts
└── container.ts                # Dependency Injection
```

**Pros:**
- ✅ Muito escalável
- ✅ Fácil adicionar domínios (imóveis, veículos, etc)
- ✅ Código independente por domínio
- ✅ Pronto para microserviços
- ✅ Testabilidade excelente

**Contras:**
- ❌ Complexidade inicial alta
- ❌ Curva de aprendizado
- ❌ Pode ser overkill para projeto pequeno
- ❌ Mais boilerplate

**Quando usar:**
- Projeto vai ter múltiplos domínios
- Time experiente com DDD
- Scaling é prioridade
- Longo prazo

**Opção SSR (Cheerio):**
- Trate `cheerio` como adapter de infraestrutura HTTP.
- Deixe a decisão Playwright/Cheerio fora do domínio, dentro da camada de adapters.
- Permita fallback para Playwright quando a extração SSR falhar.

---

## 🏗️ Arquitetura 3: Plugin-Based

Ideal para 10+ scrapers ou sistema extensível.

```
src/
├── core/
│   ├── ScraperPlugin.interface.ts
│   ├── PipelineOrchestrator.ts
│   ├── EventBus.ts
│   └── Registry.ts
├── plugins/
│   ├── olx/
│   │   ├── OlxPlugin.ts
│   │   ├── OlxScraper.ts
│   │   ├── OlxMapper.ts
│   │   └── olx.config.ts
│   ├── zap/
│   │   ├── ZapPlugin.ts
│   │   └── ...
│   ├── immobiliare/
│   │   └── ...
│   └── registry.ts
├── pipeline/
│   ├── steps/
│   │   ├── ValidateStep.ts
│   │   ├── EnrichStep.ts
│   │   ├── DeduplicateStep.ts
│   │   └── StorageStep.ts
│   └── executor.ts
├── shared/
│   ├── types/
│   ├── utils/
│   └── storage/
└── main.ts
```

**Pros:**
- ✅ Altamente extensível
- ✅ Plugins independentes
- ✅ Fácil remover/adicionar scrapers
- ✅ Hot-reload possível
- ✅ Pronto para distribuição

**Contras:**
- ❌ Complexidade muito alta
- ❌ Mais difícil de debugar
- ❌ Requer padrões rígidos

**Quando usar:**
- Plataforma scraper (app terceiros)
- Muitos scrapers heterogêneos
- SaaS scraping platform

**Opção SSR (Cheerio):**
- Separe plugins por engine: `*.http.plugin` (Cheerio) e `*.browser.plugin` (Playwright).
- Registre metadados de capacidade (SSR, JS-heavy, auth) para roteamento automático.
- Priorize execução dos plugins HTTP para ganhar throughput.

---

## 🏗️ Arquitetura 4: Queue-Based (Async Job Processing)

Ideal para scraping em larga escala com agendamento.

```
src/
├── queues/
│   ├── ScraperQueue.ts
│   ├── ProcessorQueue.ts
│   └── workers/
│       ├── scraperWorker.ts
│       ├── validatorWorker.ts
│       └── storageWorker.ts
├── scrapers/
│   ├── BaseScraper.ts
│   ├── olx/
│   └── zap/
├── jobs/
│   ├── ScrapeJob.ts
│   ├── ProcessJob.ts
│   └── DeliveryJob.ts
├── scheduler/
│   ├── Scheduler.ts
│   └── cron-jobs/
├── monitoring/
│   ├── MetricsCollector.ts
│   └── HealthCheck.ts
└── main.ts
```

**Pros:**
- ✅ Escalabilidade horizontal
- ✅ Retry automático
- ✅ Processamento assíncrono
- ✅ Agendamento robusto
- ✅ Monitoramento built-in

**Contras:**
- ❌ Infra complexa (Redis, RabbitMQ, etc)
- ❌ Debugging difícil
- ❌ Requer DevOps
- ❌ Overkill para pequenos projetos

**Quando usar:**
- Centenas de scrapers
- Scraping 24/7 em produção
- Múltiplos workers/máquinas
- SLA importante

**Opção SSR (Cheerio):**
- Crie filas distintas: `http-queue` (Cheerio) e `browser-queue` (Playwright).
- Aloque mais workers para HTTP e menos para browser (custos menores e maior volume).
- Use retry agressivo em HTTP e retry mais conservador em browser.

---

## 📋 Comparação Rápida

| Aspecto | Modular | DDD | Plugin | Queue |
|--------|---------|-----|--------|-------|
| **Simplicidade** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ |
| **Escalabilidade** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Testabilidade** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Performance (6h)** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Fit SSR (Cheerio)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Curva Aprendizado** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| **Infra Necessária** | Minimal | Minimal | Minimal | Complexa |
| **Melhor Para** | Começo | Médio prazo | Extensível | Produção |

---

## ⚡ Performance em Pipeline de 6 Horas

### Contexto: GitHub Actions/GitLab CI com Limite de Tempo

Se seus scrapers rodam em **pipelines de no máximo 6 horas**, as prioridades mudam drasticamente:

#### ❌ **Queue-Based NÃO é recomendado**
- Overhead de Redis/RabbitMQ desperdiça tempo
- Não há necessidade de processamento assíncrono
- Complexidade desnecessária para job único

#### ✅ **Recomendação: Modular + Paralelização + HTTP-first (Cheerio)**

```typescript
// main.ts - Execução paralela
const scrapers = [
  new OlxScraper(),
  new ZapScraper(),
  new VivaRealScraper(),
];

// Executar todos em paralelo
await Promise.allSettled(
  scrapers.map(scraper => scraper.run())
);
```

**Estrutura Otimizada para Pipeline:**

```
src/
├── scrapers/
│   ├── base/
│   │   ├── BaseScraper.ts          # Playwright compartilhado
│   │   ├── BaseHttpScraper.ts      # SSR com fetch + cheerio
│   │   └── ParallelExecutor.ts     # Orquestrador paralelo
│   ├── olx/
│   ├── zap/
│   └── index.ts
├── pipeline/
│   ├── orchestrator.ts              # Controla execução
│   ├── timeout-handler.ts           # Gerencia limite de 6h
│   └── checkpoint.ts                # Salva progresso
└── main.ts

scripts/
├── run-all.sh                       # Script CI/CD
└── monitor.sh                       # Tracking de tempo
```

### 🚀 Estratégias para Maximizar Performance em 6h

#### 1. **Paralelização Inteligente (HTTP primeiro)**

```typescript
// ❌ Ruim - Sequencial (desperdiça tempo)
for (const scraper of scrapers) {
  await scraper.run(); // 1h cada = 5h total
}

// ✅ Bom - Paralelo com controle
const results = await Promise.allSettled(
  scrapers.sort((a, b) => Number(a.requiresBrowser) - Number(b.requiresBrowser))
    .map(async (scraper) => {
    const timeout = setTimeout(() => {
      scraper.cancel(); // Cancela após 5h
    }, 5 * 60 * 60 * 1000);
    
    try {
      return await scraper.run();
    } finally {
      clearTimeout(timeout);
    }
    })
);
```

#### 2. **Priorização com Time Budget**

```typescript
// Scraper com prioridade e budget
interface ScraperConfig {
  priority: number;      // 1 = alta, 5 = baixa
  maxDuration: number;   // ms
  essential: boolean;    // Se falhar, todo pipeline falha
}

const scrapers = [
  { scraper: olx, priority: 1, maxDuration: 2h, essential: true },
  { scraper: zap, priority: 1, maxDuration: 2h, essential: true },
  { scraper: imovelweb, priority: 2, maxDuration: 1h, essential: false },
];

// Executar por prioridade com timeout
await executeWithPriority(scrapers, totalBudget: 6h);
```

#### 3. **Checkpointing para Re-runs**

```typescript
// Se pipeline quebrar, continua de onde parou
class CheckpointManager {
  async saveProgress(scraper: string, data: any) {
    await fs.writeFile(
      `checkpoints/${scraper}.json`,
      JSON.stringify({ lastPage, processedIds, timestamp })
    );
  }
  
  async loadProgress(scraper: string) {
    // Continua do checkpoint
  }
}
```

#### 4. **Browser Reuse (Economia de Tempo)**

```typescript
// ❌ Ruim - Abre browser a cada scraper (lento)
class OlxScraper {
  async run() {
    const browser = await playwright.chromium.launch();
    // ...
    await browser.close();
  }
}

// ✅ Bom - Reutiliza contexto
class ScraperPool {
  private browser: Browser;
  
  async initialize() {
    this.browser = await playwright.chromium.launch();
  }
  
  async runScraper(scraper: BaseScraper) {
    const context = await this.browser.newContext();
    await scraper.run(context);
    await context.close();
  }
  
  async cleanup() {
    await this.browser.close();
  }
}
```

#### 5. **Early Exit em Caso de Falha**

```typescript
const essentialScrapers = [olx, zap];
const optionalScrapers = [imovelweb, quintoandar];

// Essencial primeiro
const essentialResults = await Promise.allSettled(
  essentialScrapers.map(s => s.run())
);

// Se algum essencial falhar, aborta
if (essentialResults.some(r => r.status === 'rejected')) {
  logger.error('Essential scraper failed, aborting pipeline');
  process.exit(1);
}

// Roda opcionais com tempo restante
const remainingTime = 6h - elapsed;
await runWithTimeout(optionalScrapers, remainingTime);
```

### 📊 Benchmarks Esperados

**Cenário: 3 scrapers em pipeline de 6h**

| Abordagem | Tempo Total | Utilização |
|-----------|-------------|------------|
| **Sequencial** | 5h 30min | 92% |
| **Paralelo (3)** | 2h 15min | 38% |
| **Paralelo + Pool** | 1h 50min | 31% |
| **Paralelo + Pool + Checkpoint** | 1h 45min* | 29% |

*Com retry inteligente em caso de falha

### 🎯 Configuração Ideal para Pipeline GitHub Actions

```yaml
# .github/workflows/scrape.yml
name: Scrape Data

on:
  schedule:
    - cron: '0 */6 * * *'  # A cada 6h
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    timeout-minutes: 360  # 6h
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Load checkpoint
        run: |
          if [ -d "checkpoints" ]; then
            echo "Resuming from checkpoint"
          fi
      
      - name: Run scrapers (parallel)
        run: npm run scrape:parallel
        timeout-minutes: 350  # Deixa 10min de buffer
      
      - name: Save checkpoint
        if: failure()
        run: npm run checkpoint:save
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: scrape-results
          path: output/
```

### 🏆 Arquitetura Recomendada para Pipeline de 6h

**✅ Use: Modular Simples + HTTP-first (Cheerio) + Browser Fallback + Checkpointing**

```
src/
├── scrapers/
│   ├── base/
│   │   ├── BaseScraper.ts
│   │   ├── BaseHttpScraper.ts      # fetch + cheerio
│   │   ├── BrowserPool.ts          # Reuso de browser
│   │   └── types.ts
│   ├── olx/OlxScraper.ts
│   ├── zap/ZapScraper.ts
│   └── registry.ts                  # Lista todos
├── pipeline/
│   ├── ParallelExecutor.ts          # Orquestrador
│   ├── TimeoutManager.ts            # Controle de 6h
│   ├── CheckpointManager.ts         # Salvar/carregar
│   └── PriorityQueue.ts             # Execução inteligente
├── utils/
│   ├── logger.ts
│   └── metrics.ts                   # Tracking de tempo
└── main.ts

checkpoints/                         # Estado persistido
output/                              # Resultados
```

**Benefícios:**
- ✅ Máxima performance com paralelização
- ✅ Usa 100% do tempo disponível
- ✅ Retry inteligente com checkpoint
- ✅ Simples de debugar
- ✅ Funciona perfeitamente em GitHub Actions

**Evite:**
- ❌ Queue-Based (overhead desnecessário)
- ❌ DDD complexo (não traz ganhos de performance)
- ❌ Scraping sequencial (desperdiça tempo)

---

## 🔀 Múltiplas Pipelines em Paralelo (Conflitos de Git)

### ⚠️ Problema: Race Condition com Commits Simultâneos

Se você rodar **múltiplas pipelines em paralelo** salvando no mesmo repo:

```bash
# Pipeline 1: OLX
git pull
scraperOlx() → data/imoveis.json
git add data/imoveis.json
git commit -m "update olx"
git push  # ✅ Sucesso

# Pipeline 2: ZAP (rodando ao mesmo tempo)
git pull  # Não vê commit do OLX ainda
scraperZap() → data/imoveis.json (SOBRESCREVE!)
git add data/imoveis.json
git commit -m "update zap"
git push  # ❌ CONFLITO! ou pior, sobrescreve OLX
```

**Resultado:** Dados perdidos ou conflitos de merge constantes.

---

## 🎯 Soluções para Múltiplas Pipelines Paralelas

### ✅ Solução 1: Arquivo Separado por Scraper (Recomendado)

Cada pipeline salva em seu próprio arquivo e um job final faz merge.

```yaml
# .github/workflows/scrape-olx.yml
name: Scrape OLX
on:
  schedule:
    - cron: '0 */6 * * *'

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Run OLX scraper
        run: npm run scrape:olx
      
      - name: Save to dedicated file
        run: |
          mkdir -p data/scrapers
          mv output/imoveis.json data/scrapers/olx.json
      
      - name: Commit OLX data only
        run: |
          git add data/scrapers/olx.json
          git commit -m "update: olx data"
          git push
```

```yaml
# .github/workflows/scrape-zap.yml (similar, mas zap.json)
# .github/workflows/scrape-vivareal.yml (similar, mas vivareal.json)
```

**Job de Merge (roda após todos):**

```yaml
# .github/workflows/merge-data.yml
name: Merge Scraper Data

on:
  workflow_run:
    workflows: ["Scrape OLX", "Scrape ZAP", "Scrape VivaReal"]
    types: [completed]

jobs:
  merge:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Merge all JSON files
        run: |
          node scripts/merge-data.js \
            data/scrapers/olx.json \
            data/scrapers/zap.json \
            data/scrapers/vivareal.json \
            > data/imoveis-merged.json
      
      - name: Commit merged data
        run: |
          git add data/imoveis-merged.json
          git commit -m "merge: all scrapers data"
          git push
```

**Estrutura de Dados:**

```
data/
├── scrapers/           # Dados por scraper
│   ├── olx.json
│   ├── zap.json
│   └── vivareal.json
├── imoveis-merged.json # Dados consolidados
└── metadata.json       # Timestamp, status, etc
```

**Pros:**
- ✅ Zero conflitos
- ✅ Fácil debugar qual scraper falhou
- ✅ Pode re-rodar scraper individual
- ✅ Merge job valida e deduplica

**Contras:**
- ❌ Mais arquivos no repo
- ❌ Job extra de merge

---

### ✅ Solução 2: Branch por Pipeline + Auto-merge

Cada pipeline trabalha em sua própria branch e merge automático no final.

```yaml
# .github/workflows/scrape-olx.yml
name: Scrape OLX

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Create/checkout scraper branch
        run: |
          git checkout -B scraper/olx
          git pull origin main --rebase
      
      - name: Run scraper
        run: npm run scrape:olx
      
      - name: Commit to scraper branch
        run: |
          git add data/
          git commit -m "update: olx data"
          git push origin scraper/olx --force
      
      - name: Create PR or auto-merge
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh pr create \
            --title "Update OLX data" \
            --body "Automated scraper run" \
            --base main \
            --head scraper/olx \
            || gh pr merge scraper/olx --auto --squash
```

**Pros:**
- ✅ Isolamento total entre pipelines
- ✅ Git resolve conflitos automaticamente
- ✅ Histórico limpo com squash merge

**Contras:**
- ❌ Complexidade de gerenciar branches
- ❌ PR overhead (pode ser resolvido com auto-merge)
- ❌ Conflitos de merge ainda podem acontecer

---

### ✅ Solução 3: Lock Distribuído (Redis/GitHub API)

Usa lock para garantir que apenas uma pipeline comita por vez.

```typescript
// utils/lockManager.ts
import { Octokit } from '@octokit/rest';

class GitHubLockManager {
  private octokit: Octokit;
  
  async acquireLock(resource: string, timeout = 30 * 60 * 1000): Promise<boolean> {
    // Tenta criar uma issue com label específico
    try {
      await this.octokit.issues.create({
        owner: 'ApenasGabs',
        repo: 'querodados',
        title: `LOCK: ${resource}`,
        labels: ['lock', resource],
      });
      return true;
    } catch {
      // Lock já existe, aguarda
      await this.waitForLock(resource, timeout);
      return this.acquireLock(resource, timeout);
    }
  }
  
  async releaseLock(resource: string): Promise<void> {
    const issues = await this.octokit.issues.listForRepo({
      owner: 'ApenasGabs',
      repo: 'querodados',
      labels: ['lock', resource],
      state: 'open',
    });
    
    for (const issue of issues.data) {
      await this.octokit.issues.update({
        owner: 'ApenasGabs',
        repo: 'querodados',
        issue_number: issue.number,
        state: 'closed',
      });
    }
  }
}

// Uso na pipeline
const lock = new GitHubLockManager();

try {
  await lock.acquireLock('data-commit');
  
  // Commit seguro
  await git.pull();
  await git.add('data/imoveis.json');
  await git.commit('update data');
  await git.push();
  
} finally {
  await lock.releaseLock('data-commit');
}
```

**Pros:**
- ✅ Zero conflitos garantido
- ✅ Todas pipelines salvam no mesmo arquivo
- ✅ Simples de entender

**Contras:**
- ❌ Pipelines ficam esperando umas pelas outras
- ❌ Serializa o que era paralelo
- ❌ Deadlock se pipeline quebrar com lock ativo

---

### ✅ Solução 4: Storage Externo + Sync Job (Escalável)

Pipelines salvam em storage externo, job separado faz sync para Git.

```yaml
# .github/workflows/scrape-olx.yml
name: Scrape OLX

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Run scraper
        run: npm run scrape:olx
      
      - name: Upload to S3/Supabase/Firebase
        run: |
          # Salva com timestamp
          curl -X POST $STORAGE_API/scrapers/olx \
            -d @output/imoveis.json \
            -H "Authorization: Bearer $TOKEN"
```

```yaml
# .github/workflows/sync-to-git.yml
name: Sync Storage to Git

on:
  schedule:
    - cron: '0 */1 * * *'  # A cada 1h

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Download latest from all scrapers
        run: |
          curl $STORAGE_API/scrapers/latest > data/imoveis.json
      
      - name: Commit consolidated data
        run: |
          git add data/
          git commit -m "sync: latest data from storage"
          git push
```

**Pros:**
- ✅ Zero conflitos
- ✅ Escalável infinitamente
- ✅ Scrapers totalmente independentes
- ✅ Storage API pode fazer deduplicação

**Contras:**
- ❌ Requer infraestrutura externa
- ❌ Custo adicional (S3, Firebase, etc)
- ❌ Mais complexo

---

## 🏆 Recomendação Final: Múltiplas Pipelines

### Para QueroDADOS (3-5 scrapers)

**Use: Solução 1 - Arquivo Separado por Scraper**

```
data/
├── scrapers/
│   ├── olx.json        ← Pipeline 1
│   ├── zap.json        ← Pipeline 2
│   └── vivareal.json   ← Pipeline 3
└── imoveis.json        ← Job de merge

.github/workflows/
├── scrape-olx.yml      ← Roda independente
├── scrape-zap.yml      ← Roda independente
├── scrape-vivareal.yml ← Roda independente
└── merge-data.yml      ← Consolida tudo
```

**Benefícios:**
- ✅ Zero conflitos
- ✅ Simples de implementar
- ✅ Sem infraestrutura externa
- ✅ Fácil debugar
- ✅ Cada pipeline leva 1-2h, todas rodam em paralelo
- ✅ Job de merge leva 2-5min

**Exemplo de Timing:**
```
12:00 - Trigger todas pipelines
12:00-14:00 - OLX scraping (2h)
12:00-13:30 - ZAP scraping (1.5h)
12:00-14:15 - VivaReal scraping (2.15h)
14:15 - Trigger merge job
14:20 - Dados consolidados prontos

Total: 2h 20min vs 6h sequencial
```

### Script de Merge

```typescript
// scripts/merge-data.ts
import fs from 'fs';

interface Imovel {
  id: string;
  source: string;
  title: string;
  price: number;
  // ... outros campos
}

async function mergeScraperData(files: string[]): Promise<Imovel[]> {
  const allData: Imovel[] = [];
  const seenIds = new Set<string>();
  
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    
    for (const item of data) {
      // Deduplica por ID
      if (!seenIds.has(item.id)) {
        allData.push(item);
        seenIds.add(item.id);
      }
    }
  }
  
  // Ordena por preço
  allData.sort((a, b) => a.price - b.price);
  
  return allData;
}

// Uso
const merged = await mergeScraperData([
  'data/scrapers/olx.json',
  'data/scrapers/zap.json',
  'data/scrapers/vivareal.json',
]);

fs.writeFileSync('data/imoveis.json', JSON.stringify(merged, null, 2));

console.log(`✅ Merged ${merged.length} properties from ${files.length} sources`);
```

### Metadata para Tracking

```typescript
// data/metadata.json
{
  "lastUpdate": "2026-01-25T12:20:00Z",
  "sources": {
    "olx": {
      "lastRun": "2026-01-25T12:15:00Z",
      "itemsCount": 150,
      "status": "success"
    },
    "zap": {
      "lastRun": "2026-01-25T12:10:00Z",
      "itemsCount": 200,
      "status": "success"
    },
    "vivareal": {
      "lastRun": "2026-01-25T12:18:00Z",
      "itemsCount": 180,
      "status": "success"
    }
  },
  "totalItems": 530,
  "deduplicated": 0
}
```

---

## 🎯 Recomendação para Novo Projeto

### ⚡ Se Curva de Aprendizado NÃO é Problema

**Use: Arquitetura Modular + Paralelização Interna (Uma Única Pipeline)**

Rodando **múltiplas pipelines paralelas** pode parecer melhor, mas traz overhead de gerenciamento de conflitos. A melhor abordagem é:

#### ✅ **Uma Pipeline com Paralelização Interna** (RECOMENDADO)

```yaml
# .github/workflows/scrape-all.yml
name: Scrape All Sources

on:
  schedule:
    - cron: '0 */6 * * *'
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    timeout-minutes: 360  # 6h
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup
        run: |
          npm ci
          npx playwright install chromium
      
      - name: Run all scrapers in parallel
        run: npm run scrape:parallel
        # Internamente roda Promise.allSettled([olx, zap, vivareal])
      
      - name: Merge and validate
        run: npm run merge:validate
      
      - name: Commit results
        run: |
          git config user.name "Bot"
          git config user.email "bot@example.com"
          git add data/
          git commit -m "update: scrape data $(date +%Y-%m-%d)"
          git push
```

**Vantagens vs Múltiplas Pipelines:**
- ✅ **Zero conflitos de Git** (um único commit)
- ✅ **Mesma performance** (paralelização interna com Promise.allSettled)
- ✅ **Menos overhead** (uma VM ao invés de 3-5)
- ✅ **Mais simples de debugar** (logs em um único lugar)
- ✅ **Controle de timeout unificado** (6h para tudo)
- ✅ **Commit atômico** (ou tudo funciona ou nada)

**Estrutura Interna:**

```typescript
// src/main.ts
import { BrowserPool } from './pipeline/BrowserPool';
import { ParallelExecutor } from './pipeline/ParallelExecutor';
import { scraperRegistry } from './scrapers/registry';

async function main() {
  const pool = new BrowserPool({ maxBrowsers: 3 });
  await pool.initialize();
  
  try {
    // Executa todos scrapers em paralelo
    const executor = new ParallelExecutor(pool);
    const results = await executor.runAll(scraperRegistry);
    
    // Merge e validação
    const merged = mergeScraper Data(results);
    await validateData(merged);
    
    // Salva resultado final
    await saveToFile('data/imoveis.json', merged);
    await saveMetadata(results);
    
  } finally {
    await pool.cleanup();
  }
}
```

#### 📊 Performance Comparativa Real

**Cenário: 3 scrapers (OLX 2h, ZAP 1.5h, VivaReal 2.15h)**

| Abordagem | Tempo Total | VMs/Runners | Conflitos Git | Complexidade |
|-----------|-------------|-------------|---------------|--------------|
| **Sequencial** | 5h 45min | 1 | 0 | ⭐⭐⭐⭐⭐ |
| **Paralelo Interno** | 2h 15min | 1 | 0 | ⭐⭐⭐⭐ |
| **Múltiplas Pipelines** | 2h 15min | 3 | Alto risco | ⭐⭐ |

✅ **Paralelo Interno ganha**: mesma performance, menos complexidade, zero conflitos.

---

### 🏗️ Arquitetura Recomendada (Sem Medo de Complexidade)

**Use: Modular + DDD Lite + Paralelização**

```
src/
├── scrapers/
│   ├── base/
│   │   ├── BaseScraper.ts           # Abstract class
│   │   ├── ScraperConfig.ts
│   │   └── types.ts
│   ├── olx/
│   │   ├── OlxScraper.ts
│   │   ├── olx.config.ts
│   │   ├── selectors.ts             # Seletores isolados
│   │   ├── mapper.ts                # Raw → Domain
│   │   └── validator.ts             # Validação específica
│   ├── zap/
│   │   └── ...
│   ├── vivareal/
│   │   └── ...
│   └── registry.ts                  # Registra todos
│
├── domain/
│   ├── Imovel.ts                    # Entity principal
│   ├── Price.ts                     # Value Object
│   ├── Location.ts                  # Value Object
│   └── events/
│       └── ImovelScraped.ts         # Domain event
│
├── pipeline/
│   ├── BrowserPool.ts               # Gerencia Playwright instances
│   ├── ParallelExecutor.ts          # Orquestra scrapers
│   ├── TimeoutManager.ts            # Controla 6h limit
│   ├── CheckpointManager.ts         # Salva progresso
│   ├── MergeService.ts              # Merge + deduplica
│   └── ValidationService.ts         # Valida dados finais
│
├── infrastructure/
│   ├── FileStorage.ts               # Salva JSON
│   ├── Logger.ts                    # Winston estruturado
│   ├── MetricsCollector.ts          # Tracking
│   └── GitCommitter.ts              # Commit automático
│
├── utils/
│   ├── retry.ts                     # Retry com backoff
│   ├── timeout.ts                   # Promise timeout
│   └── delay.ts                     # Rate limiting
│
├── config/
│   ├── index.ts                     # Config geral
│   └── scrapers.ts                  # Config por scraper
│
└── main.ts                          # Entry point limpo
```

**Por que essa arquitetura?**

1. **Domain Layer** → Garante consistência de dados
2. **Pipeline Layer** → Performance com paralelização controlada
3. **Infrastructure Layer** → Logging, storage, git separados
4. **Scraper específico isolado** → Fácil adicionar/remover

**Complexidade justificada:**
- ✅ Separação clara de responsabilidades
- ✅ Fácil testar cada parte
- ✅ Escala para 10+ scrapers sem problemas
- ✅ Manutenível no longo prazo

---

### 💎 Exemplo de Implementação Core

#### BaseScraper.ts

```typescript
import type { Page, BrowserContext } from 'playwright';
import type { ScraperConfig } from './ScraperConfig';
import type { RawData, Imovel } from '../domain/types';

export abstract class BaseScraper<T extends RawData = RawData> {
  constructor(protected config: ScraperConfig) {}
  
  abstract name: string;
  abstract baseUrl: string;
  
  // Template method pattern
  async run(context: BrowserContext): Promise<Imovel[]> {
    const page = await context.newPage();
    
    try {
      await this.setup(page);
      const rawData = await this.scrape(page);
      const mapped = await this.map(rawData);
      const validated = await this.validate(mapped);
      return validated;
      
    } catch (error) {
      await this.handleError(page, error);
      throw error;
      
    } finally {
      await page.close();
    }
  }
  
  protected async setup(page: Page): Promise<void> {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({
      'User-Agent': this.config.userAgent,
    });
  }
  
  protected abstract scrape(page: Page): Promise<T[]>;
  protected abstract map(raw: T[]): Promise<Imovel[]>;
  protected abstract validate(data: Imovel[]): Promise<Imovel[]>;
  
  protected async handleError(page: Page, error: Error): Promise<void> {
    await page.screenshot({ path: `logs/${this.name}-error.png` });
    logger.error(`${this.name} failed`, { error });
  }
}
```

#### ParallelExecutor.ts

```typescript
import type { BrowserPool } from './BrowserPool';
import type { BaseScraper } from '../scrapers/base/BaseScraper';
import { TimeoutManager } from './TimeoutManager';

export class ParallelExecutor {
  constructor(
    private pool: BrowserPool,
    private timeoutManager = new TimeoutManager(6 * 60 * 60 * 1000)
  ) {}
  
  async runAll(scrapers: BaseScraper[]): Promise<ScraperResult[]> {
    const results = await Promise.allSettled(
      scrapers.map(async (scraper) => {
        const context = await this.pool.getContext();
        
        try {
          // Timeout individual por scraper (5h)
          const data = await this.timeoutManager.withTimeout(
            scraper.run(context),
            scraper.config.maxDuration
          );
          
          return {
            scraper: scraper.name,
            status: 'success' as const,
            data,
            duration: Date.now() - startTime,
          };
          
        } catch (error) {
          return {
            scraper: scraper.name,
            status: 'failed' as const,
            error: error.message,
            duration: Date.now() - startTime,
          };
          
        } finally {
          await this.pool.releaseContext(context);
        }
      })
    );
    
    return results.map(r => r.status === 'fulfilled' ? r.value : r.reason);
  }
}
```

#### BrowserPool.ts

```typescript
import { chromium, type Browser, type BrowserContext } from 'playwright';

export class BrowserPool {
  private browser: Browser | null = null;
  private contexts: BrowserContext[] = [];
  private availableContexts: BrowserContext[] = [];
  
  constructor(private config: { maxBrowsers: number }) {}
  
  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    // Pre-cria contextos
    for (let i = 0; i < this.config.maxBrowsers; i++) {
      const context = await this.browser.newContext();
      this.contexts.push(context);
      this.availableContexts.push(context);
    }
  }
  
  async getContext(): Promise<BrowserContext> {
    while (this.availableContexts.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return this.availableContexts.pop()!;
  }
  
  async releaseContext(context: BrowserContext): Promise<void> {
    this.availableContexts.push(context);
  }
  
  async cleanup(): Promise<void> {
    await Promise.all(this.contexts.map(c => c.close()));
    await this.browser?.close();
  }
}
```

---

### 🎯 Decisão Final

Se **curva de aprendizado não é problema** e você quer **máxima performance com mínimo de fricção**:

#### ✅ **Recomendação: Modular + DDD Lite + Paralelização Interna**

**Motivos:**
1. **Performance máxima** → 3x mais rápido que sequencial
2. **Zero conflitos Git** → Uma pipeline, um commit
3. **Escalável** → Adiciona scrapers facilmente
4. **Testável** → Cada camada isolada
5. **Profissional** → Estrutura enterprise-grade
6. **Manutenível** → Código organizado e limpo

**Não Use:**
- ❌ Múltiplas pipelines paralelas (overhead de conflitos)
- ❌ Queue-based (complexidade desnecessária para job de 6h)
- ❌ Sequencial (desperdiça 3-4h de tempo)

**Próximo Passo:**
Posso criar o template completo com essa arquitetura se quiser começar a implementar!

---

## 🛠️ Stack Recomendado para Cada Arquitetura

### Modular Simples
```json
{
  "dependencies": {
    "playwright": "^1.40.0",
    "winston": "^3.11.0",
    "joi": "^17.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "ts-node": "^10.9.0"
  }
}
```

### DDD
```json
{
  "dependencies": {
    "playwright": "^1.40.0",
    "winston": "^3.11.0",
    "joi": "^17.0.0",
    "tsyringe": "^4.8.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "ts-node": "^10.9.0"
  }
}
```

### Plugin-Based
```json
{
  "dependencies": {
    "playwright": "^1.40.0",
    "winston": "^3.11.0",
    "joi": "^17.0.0",
    "tsyringe": "^4.8.0",
    "eventemitter3": "^5.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "ts-node": "^10.9.0"
  }
}
```

### Queue-Based
```json
{
  "dependencies": {
    "playwright": "^1.40.0",
    "winston": "^3.11.0",
    "joi": "^17.0.0",
    "bull": "^4.11.0",
    "ioredis": "^5.3.0",
    "tsyringe": "^4.8.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "ts-node": "^10.9.0"
  }
}
```

---

## 💡 Princípios Fundamentais

Independente da arquitetura escolhida:

### 1. **Separação de Responsabilidades**
```typescript
// ❌ Ruim - Tudo misturado
async function scrape() {
  const page = await browser.newPage();
  await page.goto(url);
  const data = await page.evaluate(...);
  // Scraping + Mapping + Validação + Storage
}

// ✅ Bom - Cada coisa no seu lugar
async function scrape() {
  const raw = await scraper.fetch(url);
  const mapped = mapper.toImovel(raw);
  validator.validate(mapped);
  await storage.save(mapped);
}
```

### 2. **Configuração Centralizada**
```typescript
// config/index.ts
export const scraperConfig = {
  olx: { timeout: 30000, retries: 3 },
  zap: { timeout: 25000, retries: 2 },
};
```

### 3. **Logging Estruturado**
```typescript
logger.info('Scraping started', { scraper: 'olx', url });
logger.error('Failed to fetch', { error, retries: 2 });
```

### 4. **Validação de Dados**
```typescript
// Sempre validar dados coletados
const schema = joi.object({
  title: joi.string().required(),
  price: joi.number().positive().required(),
});
```

### 5. **Error Handling Robusto**
```typescript
try {
  await scraper.run();
} catch (error) {
  if (isRecoverable(error)) {
    await retry();
  } else {
    await notifyOps();
  }
}
```

### 6. **Sem Duplicação**
- Lógica compartilhada em `BaseScraper`
- Utilitários em `utils/`
- Config centralizada

---

## 🚀 Próximos Passos

Recomendo começar com a **Arquitetura Modular Simples** e evoluir conforme necessário.

Se quiser, posso criar um template starter com essa arquitetura!

