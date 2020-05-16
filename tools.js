const cheerio = require('cheerio');
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

module.exports = {
  getCookie,
  analysisCsrfToken
}