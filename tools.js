const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const getCookie = (res) => {
  let cookieList = res.header['set-cookie'];
  let targetCookieList = cookieList.map(ele => {
    let strList = ele.split(';');
    return strList[0];
  }); 
  let cookie = targetCookieList.join('; ')
  return cookie;
};

const analysisCsrfToken = (res) => {
  let csrfToken = '';
  let $ = cheerio.load(res.text);
  $("meta[name=csrf-token]").each((index, ele) => {
    csrfToken = $(ele).attr('content');
  });
  return csrfToken;
}

const anlysisM3u8 = (filePath, dir) => {
  let fileUrlList = [];
  fs.readFile(filePath, (err, data) => {
    let i = 0;
    let content = data.toString();
    let strList = content.split('\n');
    let targetList = [];
    let output = 'ffconcat version 1.0\n';
    strList.forEach(item => {
      if (item.includes('e=')) {
        targetList.push(item);
        fileUrlList.push('http://videocdn.codingke.com' + item);
        let str = `${i}.ts`;
        if (str.length < 9) {
          output += `file ${completion(str)}\n`;
          i++;
        }
      }
    });
    fs.writeFile(path.resolve(dir, 'input.txt'), output, err => {
      if (err) throw err;
    })
  });
}

const completion = (str) => {
  if (str.length < 9) {
    let length = 9 - str.length ;
    for (let i = 0; i < length; i++) {
      str = '0' + str;
    }
  }
  return str;
}

module.exports = {
  getCookie,
  analysisCsrfToken,
  anlysisM3u8
}