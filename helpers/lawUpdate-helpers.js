const fetch = require('node-fetch')
const cheerio = require('cheerio')
const db = require('../models')
const { Code, Article } = db
// 請求全國法規資料庫的最新訊息頁面
const updateLaw = async () => {
  let pageTotal = 1
  let pageNumber = 1
  const link = []
  let updateDate = '112-01-06'// json檔建立時間
  const updateDateArray = updateDate.split('-')
  try { // 抓取所有更新頁面連結
    while (link.length === 20 * (pageNumber - 1) && pageTotal !== (pageNumber - 1)) {
      // 請求頁面
      const response = await fetch(`https://law.moj.gov.tw/News/NewsList.aspx?type=l&page=${pageNumber}&psize=20`)
      const pageText = await response.text()
      const $ = cheerio.load(pageText)
      // 抓取頁次數目
      const pageInfo = $('li.pageinfo').text()
      const indexStart = pageInfo.indexOf('/') + 1
      const indexEnd = pageInfo.indexOf('顯示')
      pageTotal = pageInfo.slice(indexStart, indexEnd)
      // 抓取更新頁面連結
      getPageLink($, link, updateDateArray)
      pageNumber++
    }
  } catch (error) {
    console.log(error)
  }
  // 更新法規資料
  try {
    await Promise.all(
      link.map(
        async (link) => {
          // 請求更新內容頁面
          const response = await fetch(link)
          const pageText = await response.text()
          const $ = cheerio.load(pageText)
          const title = $('h2').text()
          // 制定法規
          if (title.includes('制定')) {
            createCode($, title)
          }
          // 廢止法規
          else if (title.includes('廢止')) {
            deleteCode(title)
          // 增訂、刪除並修正法規
          } else {
            correctCode($, title)
          }
        })
    )
  } catch (error) {
    console.log(error)
  }
  // 更新時間
  const today = new Date()
  const year = today.getFullYear() - 1911
  const month = today.getMonth() + 1
  updateDate = `${year}-${month}-${today.getDate()}`
}
// 抓取單頁上次更新時間以後的連結
const getPageLink = ($, link, updateDateArray) => {
  $('.table tbody tr td').each((i, e) => {
    if ($(e).text() === '法律') {
      const date = $(e).prev().text()
      const dateArray = date.split('-')
      if (dateArray[0] > updateDateArray[0] || (dateArray[0] === updateDateArray[0] && dateArray[1] > updateDateArray[1]) || (dateArray[0] === updateDateArray[0] && dateArray[1] === updateDateArray[1] && dateArray[2] >= updateDateArray[2])) {
        link.push('https://law.moj.gov.tw/News/' + $(e).next().find('a').attr('href'))
      }
    }
  })
}
// 制定法規
const createCode = async ($, title) => {
  const indexStart = title.indexOf('制定') + 1
  const indexEnd = title.includes('法') ? title.indexOf('法') + 1 : title.indexOf('條例') + 2
  const name = title.slice(indexStart, indexEnd)
  const code = await Code.create({ name })
  // 新增法條
  const article = []
  $('td.text-pre br').each(async (i, e) => {
    if ($(e).text().includes('第')) {
      let articleNo = $(e).text()
      articleNo = articleNo.slice(articleNo.length, articleNo.length - 1).trim()
      const content = $(e).next().text()
      article.push({ articleNo, content, codeId: code.id })
    }
  })
  await Article.create(article)
}
// 廢止法規
const deleteCode = async (title) => {
  const indexStart = title.indexOf('廢止') + 1
  const indexEnd = title.includes('法') ? title.indexOf('法') + 1 : title.indexOf('條例') + 2
  const name = title.slice(indexStart, indexEnd)
  const code = await Code.findOne({ where: { name } })
  await code.destroy()
}
// 增訂、刪除並修正法規
const correctCode = async ($, title) => {
  // 查找法規
  let name = title
  const array = ['修正', '增訂', '刪除', '、', '並']
  array.forEach(a => { name = name.replace(a, '') })
  const code = await Code.findOne({ where: { name } })
  const articleCreate = []
  // 查找法條
  $('td.text-pre br').each(async (i, e) => {
    if ($(e).text().includes('第')) {
      let articleNo = $(e).text()
      articleNo = articleNo.slice(articleNo.length, articleNo.length - 1).trim()
      const content = $(e).next().text()
      const article = await Article.findOne({ where: { articleNo } })
      // 刪除法條
      if (content === '(刪除)') {
        await article.destroy()
        // 要新增的法條
      } else if (!article) {
        articleCreate.push({ articleNo, content, codeId: code.id })
        // 修正法條
      } else {
        await article.update({ content })
      }
    }
  })
  // 新增法條
  await Article.create(articleCreate)
}
module.exports = { updateLaw }
