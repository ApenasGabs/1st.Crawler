// Exemplo SSR com Cheerio: extrair primeira citação sem browser
import * as cheerio from "cheerio";

const main = async (): Promise<void> => {
  const response = await fetch("https://quotes.toscrape.com/");

  if (!response.ok) {
    throw new Error(`Falha ao carregar página: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const firstQuote = $(".quote").first();
  const text = firstQuote.find(".text").text().trim();
  const author = firstQuote.find(".author").text().trim();

  console.log({ text, author });
};

void main();
