const axios = require('axios');
const superagent = require('superagent');
const tools = require('./tools');
const cheerio = require('cheerio');
const config = require('./config');
const fs = require('fs');
const path = require('path');
const analysisCsrfToken = tools.analysisCsrfToken;
const anlysisM3u8 = tools.anlysisM3u8;
const downLoadFile = tools.downLoadFile;
const browserMsg = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
};

const globalCookie = {};

const getCookie = (res) => {
  let cookieList = res.header['set-cookie'];
  let targetCookieList = cookieList.map(ele => {
    let strList = ele.split(';');
    strList.forEach(item => {
      let keyValue = item.split('=');
      globalCookie[keyValue[0]] = keyValue[1];
    });
    return strList[0];
  });
  // console.log(globalCookie);
  let cookie = ''
  for (let x in globalCookie) {
    cookie += `${x}=${globalCookie[x]}; `;
  }
  return cookie;
};


let csrfToken = '';
let url = 'http://www.codingke.com/login';
const reptileFn = (url, browserMsg) => {
  superagent.get(url).set(browserMsg).end((err, res) => {
    if (err) throw err;
    let cookie = getCookie(res);
    csrfToken = analysisCsrfToken(res);
    loginFn(csrfToken, cookie);
  });
}


const loginFn = (CsrfToken, cookie) => {
  let headers = {
    Accept: "*/*",
    "Accept-Encoding": 'gzip, deflate',
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7,zh-TW;q=0.6',
    Cookie: cookie,
    DNT: 1,
    // Host: 'www.codingke.com',
    // Origin: 'http://www.codingke.com',
    // Referer: "http://www.codingke.com/login",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
    "X-CSRF-Token": CsrfToken,
    // Connection: 'keep-alive',
    "X-Requested-With": 'XMLHttpRequest'
  };
  let loginData  = {
    _username: '',
    _password: '',
    _csrf_token: CsrfToken
  }

  superagent
    .post('http://www.codingke.com/login_check')
    .send(loginData)
    .set(headers)
    .then((res) => {
      // console.log(1);
      headers.Cookie = getCookie(res);
      // console.log(headers.Cookie);
      lesson(headers);
    })
    .catch(err => {
      console.log(err);
    })

}

const lesson = (headers) => {
  superagent
    .get('http://www.codingke.com/study/v/11096-lesson')
    .set(headers)
    .then((res) => {
      console.log('lesson');
      let $ = cheerio.load(res.text);
      let courseId = $('#courseId').val();
      let lessonId = $('#lessonId').val();
      csrfToken = analysisCsrfToken(res);
      let mediaUrl = `/study/${courseId}/lesson/${lessonId}?token=${csrfToken}c`;
      getMediaHLSUrl(headers, mediaUrl, lessonId);
    })
    .catch(err => {
      console.log(err);
    })
}

const getMediaHLSUrl = (headers, url, lessonId) => {
  superagent
    .get(config.baseUrl + url)
    .set(headers)
    .then((res) => {
      console.log('getMediaHLSUrl');
      let mediaUrl = res.body.mediaHLSUri;
      csrfToken = analysisCsrfToken(res);
      let fileName = mediaUrl.match(/\.com\/(\S*)\?pm/)[1];
      getMedia(mediaUrl, fileName, lessonId);
    })
    .catch(err => {
      console.log(err);
    })
}

const getMedia = (url, fileName, lessonId) => {
  let dir = path.resolve(__dirname, lessonId);
  // 判断文件夹是否存在
  if (!fs.existsSync(dir)) {
    fs.mkdir(dir, err => {
      if (err) throw err;
    });
  }
  let filePath = path.resolve(__dirname, lessonId, fileName)
  let stream = fs.createWriteStream(filePath);
  superagent
    .get(url)
    .pipe(stream);
  stream.on('finish', () => {
    console.log('=======================================写入完成=========================================');
    anlysisM3u8(filePath, dir).then(downloadUrlList => {
      // console.log(downloadUrlList);
      downloadUrlList.forEach((item, i) => {
        console.log(item);
        setTimeout(() => {
          downLoadFile(item, lessonId);
        }, i * 2000)
      })
    }).catch(err => {
      console.log(err);
    });
  })
}


module.exports = reptileFn;