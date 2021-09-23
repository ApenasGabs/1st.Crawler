const request = require("request");
const cheerio = require("cheerio");
console.log("1");
// request(
//     "https://www.kabum.com.br/produto/112807/projetor-lg-cinebeam-smart-tv-140-uhd-4k-hdr10-1500-ansi-lumens-hdmi-usb-bluetooth-wi-fi-branco-hu70la",
//     (error, resp, html) => {
//         if (!error && resp.statusCode == 200) {
//             const $ = cheerio.load(html);
//             const resto = $(
//                 "#cardAlertaOferta > div.sc-gNJABI.fAHwND > div:nth-child(3) > b"
//             );
//             console.log(resto);
//             console.log("2");
//         }
//     }
// );
request(
    "https://www.google.com/search?q=dolar",
    (error, resp, html) => {
        if (!error && resp.statusCode == 200) {
            const $ = cheerio.load(html);
            const resto = $(
                ".a61j6 vk_gy vk_sh Hg3mWc"
            );
            console.log(resto);
            console.log("2");
        }
    }
);
console.log("3");