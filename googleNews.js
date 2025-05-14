const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("https://news.google.com");

  const titles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("article a")).map(
      (el) => el.innerText
    );
  });

  console.log(titles);

  await browser.close();
})();
