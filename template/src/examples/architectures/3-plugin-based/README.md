# 3. Arquitetura Plugin-Based

**Conceito**: Scrapers são plugins dinamicamente carregáveis e registráveis.

## Quando usar
- Muitos scrapers (6+)
- Scrapers ativados/desativados dinamicamente
- Comunidade de contribuidores

## Estrutura

```
├── src/
│   ├── plugins/
│   │   ├── IPlugin.ts           # Interface
│   │   ├── PluginRegistry.ts    # Registro dinâmico
│   │   ├── PluginLoader.ts      # Carregador
│   │   └── plugins/
│   │       ├── QuotePlugin.ts
│   │       └── BookPlugin.ts
│   ├── core/
│   │   ├── Engine.ts            # Engine de plugins
│   │   └── Config.ts
│   └── main.ts
└── package.json
```

## Vantagens
✅ Plugins independentes
✅ Carregar/descarregar dinamicamente
✅ Fácil para comunidade contribuir
✅ Escalável horizontalmente
✅ Permite plugins SSR (`cheerio`) e browser (`playwright`)

## Desvantagens
❌ Complexo de implementar
❌ Runtime overhead
❌ Descoberta de plugins pode ser lenta

## Como rodar

```bash
npm install
npx tsx main.ts
```

## Adicionando novo plugin

1. Crie arquivo em `src/plugins/plugins/MyPlugin.ts`
2. Implemente `IPlugin`
3. Registre em `PluginRegistry`
4. Engine automáticamente detecta e roda

Perfeito para ecossistema de plugins.

## Opção SSR com Cheerio

- Defina metadado de engine no plugin (`http` ou `browser`).
- Priorize plugins HTTP para ganho de throughput.
- Use plugin browser como fallback para conteúdo dinâmico.
