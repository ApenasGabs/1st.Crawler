# Documentação de Variáveis de Ambiente

## Setup Inicial

1. Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Customize conforme sua necessidade

## Variáveis por Contexto

### 🖥️ Local Development

```bash
BROWSER_CONTEXTS=1
BROWSER_HEADLESS=false
LOG_LEVEL=debug
SCRAPER_TIMEOUT=600
AUTO_COMMIT=false
```

Para debug, você pode ver o browser aberto enquanto scrape.

### 🚀 CI/CD (GitHub Actions)

```bash
BROWSER_CONTEXTS=3
BROWSER_HEADLESS=true
LOG_LEVEL=info
SCRAPER_TIMEOUT=300
AUTO_COMMIT=true
VALIDATE_DATA=true
```

⚠️ **Importante**: Configure esses secrets no GitHub:
- `GIT_USER_NAME` e `GIT_USER_EMAIL`: para commit automático
- `GITHUB_TOKEN`: para fazer push (ou use o token default)

### 🔧 Performance Tuning

| Variável | Impacto | Trade-off |
|---|---|---|
| `BROWSER_CONTEXTS` | Mais contextos = mais paralelo | ⚠️ Mais RAM, possíveis timeouts |
| `SCRAPER_TIMEOUT` | Timeout por scraper | ⚠️ Muito curto = falhas, muito longo = espera desnecessária |
| `MAX_RETRIES` | Resiliência | ⚠️ Mais tentativas = mais tempo de pipeline |
| `RETRY_DELAY` | Espera entre retentativas | ⚠️ Delay muito curto pode ser bloqueado |

### 📊 Recomendações por Escala

#### Pequeno (1-2 scrapers, <1h de dados)
```bash
BROWSER_CONTEXTS=2
SCRAPER_TIMEOUT=300
MAX_RETRIES=1
```

#### Médio (3-5 scrapers, ~2h de dados)
```bash
BROWSER_CONTEXTS=3
SCRAPER_TIMEOUT=600
MAX_RETRIES=2
```

#### Grande (6+ scrapers, ~4h de dados)
```bash
BROWSER_CONTEXTS=5
SCRAPER_TIMEOUT=900
MAX_RETRIES=2
VALIDATE_DATA=false  # Para ganhar tempo se já validou localmente
```

### 🔐 Secrets do GitHub Actions

No repositório, vá para **Settings → Secrets and variables → Actions** e configure:

```yaml
GIT_USER_NAME: "crawler-bot"
GIT_USER_EMAIL: "crawler-bot@users.noreply.github.com"
GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}  # Token automático do Actions
```

## Exemplo .env Completo

```bash
# Browser
BROWSER_CONTEXTS=3
SCRAPER_TIMEOUT=300
BROWSER_HEADLESS=true

# Dados
DATA_OUTPUT_DIR=data/scrapers
VALIDATE_DATA=true

# Logging
LOG_LEVEL=info
LOG_FILE=logs/scraper.log

# Retry
MAX_RETRIES=2
RETRY_DELAY=5

# CI/CD
AUTO_COMMIT=false

# Scraping
USER_AGENT=
NAVIGATION_TIMEOUT=30000
```

## Troubleshooting

### "Timeout esperando página carregar"
→ Aumentar `SCRAPER_TIMEOUT` ou `NAVIGATION_TIMEOUT`

### "Muitos contextos causando crash"
→ Reduzir `BROWSER_CONTEXTS`

### "Dados incompletos/inválidos"
→ Ativar `LOG_LEVEL=debug` e revisar os logs

### "CI/CD não faz push"
→ Verificar `GITHUB_TOKEN` e permissões do bot
