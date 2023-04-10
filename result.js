
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const dns = require('dns');


const loadPage = async () => {
  try{
    dns.setDefaultResultOrder('ipv4first')
    const response = await fetch('https://law.moj.gov.tw/News/NewsList.aspx?type=l&page=1&psize=20')
  const pageText = await response.text()
  const $ = cheerio.load(pageText)
    const pageInfo = $('li.pageinfo').text()
    console.log(`pageInfo:${pageInfo}`)
}catch(err){
  console.log(err)
}
}

loadPage()