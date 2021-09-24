const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.kabum.com.br/produto/112807/";
console.log("1");
axios(url)
    .then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);
        const resto = $(
            "#cardAlertaOferta > div.sc-gNJABI.fAHwND > div:nth-child(3) > b"
        );
        console.log(resto.text);
    })
    .catch(console.error);
// request(
//     "https://www.google.com/search?q=dolar",
//     (error, response, html) => {
//         if (!error && response.statusCode == 200) {
//             const $ = cheerio.load(html);
//             const resto = $('.a61j6 vk_gy vk_sh Hg3mWc');
//             console.log(resto);
//             console.log("2");
//         }
//     }
// );
console.log("3");