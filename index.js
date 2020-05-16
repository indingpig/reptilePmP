const express = require('express');
const app = express();
const os = require('os');
const superagent = require('superagent');
const cheerio = require('cheerio');
const fs = require('fs');

const server = app.listen(8000, () => {
  let host = os.networkInterfaces()['以太网'][1].address;
  let port = server.address().port;
  console.log(`Your app is running at http://${host}:${port}`);
});


app.get('/', (req, res) => {
  res.send('Hello world!')
})

const browserMsg = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36"
};

let csrfToken = '';
let url = 'http://www.codingke.com/login';
superagent.get(url).set(browserMsg).end((err, res) => {
  if (err) throw err;
  // console.log(res);

  let cookieList = res.header['set-cookie'];
  let targetCookieList = cookieList.map(ele => {
    let strList = ele.split(';');
    return strList[0];
  });
  
  console.log(targetCookieList.join('; '));
  csrfToken = analysisCsrfToken(res);
  // resolve(csrfToken);
});
const analysisCsrfToken = (res) => {
  let csrfToken = '';
  let $ = cheerio.load(res.text);
  $("meta[name=csrf-token]").each((index, ele) => {
    csrfToken = $(ele).attr('content');
  });
  return csrfToken;
}