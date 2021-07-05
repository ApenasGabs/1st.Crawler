var req = require('request');
var cheerio = require('cheerio');

req('http://www.imdb.com/chart/moviemeter', (err, res, body) => {
  if (err) console.log("erro" + err);
  var $ = cheerio.load(body);
  $(".lister-list tr").each(() => {
    var title = $(this).find('.titleColumn a').text().trim();
    var rating = $(this).find('.imdbRating strong').text().trim();
    console.log('Titulo:'+ title,'Nota:'+ rating);
  });
});
