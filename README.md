# 1st.Crawler

Um projeto simples de web scraping utilizando Puppeteer e Playwright para extrair informações de websites.

## Descrição

Este projeto contém três crawlers diferentes:

1. **Conversor de Moeda**: Extrai a cotação atual do dólar em relação ao real diretamente do Google usando Puppeteer.
2. **Verificador de Estoque**: Monitora a disponibilidade de um produto específico na loja Kabum usando Puppeteer.
3. **Google News**: Extrai os títulos de notícias do Google News usando Playwright.

## Pré-requisitos

- Node.js instalado (versão recomendada: 12.x ou superior)
- Yarn ou npm para gerenciamento de pacotes

## Instalação

Clone o repositório:

```bash
git clone https://github.com/Apenasgabs/1st.Crawler.git
cd 1st.Crawler
```

Instale as dependências:

```bash
yarn install
# OU
npm install
```

## Como Usar

### Conversor de Moeda (Dólar para Real)

Para executar o crawler que verifica a cotação do dólar:

```bash
node index.js
```

Este comando abrirá um navegador Chrome, navegará até o Google com a pesquisa "dolar para real" e extrairá o valor atual da cotação.

### Verificador de Estoque Kabum

Para verificar a disponibilidade de um produto específico na Kabum:

```bash
node kabum.js
```

Este crawler executará em modo headless (sem interface gráfica visível) e verificará a quantidade disponível do produto específico (no caso, um projetor LG) na loja Kabum.

### Google News

Para extrair títulos de notícias do Google News:

```bash
node googleNews.js
```

Este crawler utiliza Playwright para acessar o Google News e extrair os títulos de artigos disponíveis na página.

## Personalização

### Alterando a consulta de moeda

No arquivo `index.js`, você pode modificar as variáveis `moedaBase` e `moedaFinal` para converter entre diferentes moedas:

```javascript
const moedaBase = "euro"; // ou qualquer outra moeda
const moedaFinal = "real"; // ou qualquer outra moeda
```

### Alterando o produto monitorado na Kabum

No arquivo `kabum.js`, modifique a URL para o produto que deseja monitorar:

```javascript
const myPage = `https://www.kabum.com.br/produto/[ID_DO_PRODUTO]/[NOME-DO-PRODUTO]`;
```

### Personalizando a extração de notícias

No arquivo `googleNews.js`, você pode modificar o seletor CSS para extrair diferentes elementos da página ou alterar a URL para outro site de notícias.

## Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [Puppeteer](https://pptr.dev/) - Biblioteca para controle do navegador Chrome/Chromium
- [Playwright](https://playwright.dev/) - Framework moderno para automação de navegadores

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
