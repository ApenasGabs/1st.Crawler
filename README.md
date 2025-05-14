# 1st.Crawler

Um projeto simples de web scraping utilizando Puppeteer para extrair informações de websites.

## Descrição

Este projeto contém dois crawlers diferentes:

1. **Conversor de Moeda**: Extrai a cotação atual do dólar em relação ao real diretamente do Google.
2. **Verificador de Estoque**: Monitora a disponibilidade de um produto específico na loja Kabum.

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

## Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [Puppeteer](https://pptr.dev/) - Biblioteca para controle do navegador Chrome/Chromium

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
