const puppeteer = require("puppeteer");

async function robo() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const moedaBase = "dolar",
    moedaFinal = "real";
  const myPage = `https://www.google.com/search?q=${moedaBase}+para+${moedaFinal}`;
  await page.goto(myPage);
  const resultado = await page.evaluate(() => {
    return document.querySelector(".a61j6.vk_gy.vk_sh.Hg3mWc").value;
  });
  console.log(`O valor de 1 ${moedaBase} para ${moedaFinal} é ${resultado}`);
  await browser.close();
}
robo();
