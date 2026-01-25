// Exemplo Playwright: extrair primeira citação de um site público de treino
import { chromium } from "playwright";

const main = async (): Promise<void> => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("https://quotes.toscrape.com/");

  const firstQuote = await page.locator(".quote").first();
  const text = (await firstQuote.locator(".text").textContent()) ?? "";
  const author = (await firstQuote.locator(".author").textContent()) ?? "";

  console.log({ text: text.trim(), author: author.trim() });
  await browser.close();
};

void main();
