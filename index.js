const puppeteer = require("puppeteer");

async function robo() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://venturus.org.br/");
  await page.screenshot({ path: "img/venturus.png" });
  await browser.close();
}

robo();
