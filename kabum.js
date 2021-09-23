const puppeteer = require("puppeteer");

async function robo() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const myPage = `https://www.kabum.com.br/produto/112807/projetor-lg-cinebeam-smart-tv-140-uhd-4k-hdr10-1500-ansi-lumens-hdmi-usb-bluetooth-wi-fi-branco-hu70la`;
    await page.goto(myPage);
    const resultado = await page.evaluate(() => {
        return document.querySelector(
            "#cardAlertaOferta > div.sc-gYtlsd.hQFVon > div:nth-child(3) > b"
        );
    });
    console.log(`ainda tem ${resultado} unidades`);
    await browser.close();
}
robo();