const axios = require('axios');
const superagent = require('superagent');
const tools = require('./tools');
const analysisCsrfToken = tools.analysisCsrfToken;
const getCookie = tools.getCookie;

const browserMsg = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
};

let csrfToken = '';
let url = 'http://www.codingke.com/login';
superagent.get(url).set(browserMsg).end((err, res) => {
  if (err) throw err;
  
  let cookie = getCookie(res);
  csrfToken = analysisCsrfToken(res);
  loginFn(csrfToken, cookie);
});


const loginFn = (CsrfToken, cookie) => {
  let headers = {
    Accept: "*/*",
    "Accept-Encoding": 'gzip, deflate',
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7,zh-TW;q=0.6',
    Cookie: cookie,
    DNT: 1,
    Host: 'www.codingke.com',
    Origin: 'http://www.codingke.com',
    Referer: "http://www.codingke.com/login",
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
    .then((data) => {
      console.log(1);
      headers.Cookie = getCookie(data);
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
    .then((data) => {
      console.log('lesson');
      console.log(data);
      headers.Cookie = getCookie(data);
    })
    .catch(err => {
      console.log(err);
    })
}