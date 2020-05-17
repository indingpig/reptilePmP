const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const superagent = require('superagent');
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
  return new Promise((resolve, reject) => {
    let fileUrlList = [];
    fs.readFile(filePath, (err, data) => {
      if (err) { reject(err) };
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
            output += `file '${path.resolve(dir, completion(str))}'\n`;
            i++;
          }
        }
      });
      fs.writeFileSync(path.resolve(dir, 'input.txt'), output, err => {
        if (err) reject(err);
      })
      let downloadContent = fileUrlList.join('\n');
      fs.writeFileSync(path.resolve(dir, 'download.txt'), downloadContent, err => {
        if (err) reject(err);
      })
      resolve(fileUrlList);
    });
  })
  // return fileUrlList;
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

const downLoadFile = (url, lessonId) => {
  // let url = 'http://videocdn.codingke.com/qzX-JHCDGR-XCbOx58jadJXy_0w=/lsWbey7xVUsDf_kEDLEjqmNJi9qo/000000.ts?e=1589734531&token=ubkvfPgFKRgwM9o-1TnA9xp5OHi4NCsYiLWahA_s:_S2_7Emssk8yO2aBVriC3PZjmIw'
  let fileName = '0' + url.match(/\/0(\S*)\?e=/)[1];
  let stream = fs.createWriteStream(path.resolve(__dirname, lessonId, fileName));
  console.log(path.resolve(__dirname, lessonId, fileName));
  superagent
  .get(url)
  .pipe(stream);
}

module.exports = {
  getCookie,
  analysisCsrfToken,
  anlysisM3u8,
  downLoadFile
}