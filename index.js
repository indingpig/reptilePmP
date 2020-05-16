const express = require('express');
const app = express();
const os = require('os');
const superagent = require('superagent');
const cheerio = require('cheerio');
const fs = require('fs');
const reptileFn = require('./login');

const server = app.listen(8000, () => {
  let host = os.networkInterfaces()['以太网'][1].address;
  let port = server.address().port;
  console.log(`Your app is running at http://${host}:${port}`);
});


app.get('/', (req, res) => {
  res.send('Hello world!')
})

const browserMsg = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
};
let url = 'http://www.codingke.com/login';

reptileFn(url, browserMsg);