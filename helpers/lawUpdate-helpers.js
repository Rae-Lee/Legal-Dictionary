const fetch = require('node-fetch')
const cheerio = require('cheerio')
const db = require('../models')
const { Code, Article } = db
// 請求全國法規資料庫的最新訊息頁面
const updateLaw = async (updateDate) => {
  let pageTotal = 1
  let pageNumber = 1
  const link = []
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
      await getPageLink($, link, updateDateArray)
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
            const code = {}
            const article = []
            // 新增法規
            await createCode(title, code)
            // 整理並新增法條
            await processArticle($, code, article)
            await Article.bulkCreate(article)
          }
          // // 廢止法規
          else if (title.includes('廢止')) {
            await deleteCode(title)
          }
          // 增訂、刪除並修正法規
          else {
            await correctCode($, title)
          }
        })
    )
  } catch (error) {
    console.log(error)
  }
  // 更新時間
  const today = new Date()
  const year = today.getFullYear() - 1911
  const month = (today.getMonth() + 1) >= 10 ? (today.getMonth() + 1) : ('0' + (today.getMonth() + 1))
  const date = today.getDate() < 10 ? ('0' + today.getDate()) : today.getDate()
  updateDate = `${year}-${month}-${date}`
}
// 抓取單頁上次更新時間以後的連結
const getPageLink = async ($, link, updateDateArray) => {
  await $('.table tbody tr td').each((i, e) => {
    if ($(e).text() === '法律') {
      const date = $(e).prev().text()
      const dateArray = date.split('-')
      if (dateArray[0] > updateDateArray[0] || (dateArray[0] === updateDateArray[0] && dateArray[1] > updateDateArray[1]) || (dateArray[0] === updateDateArray[0] && dateArray[1] === updateDateArray[1] && dateArray[2] >= updateDateArray[2])) {
        link.push('https://law.moj.gov.tw/News/' + $(e).next().find('a').attr('href'))
      }
    }
  })
}
// 新增法規
const createCode = async (title, code) => {
  const indexStart = title.indexOf('制定') + 2
  const indexEnd = title.includes('法') ? title.indexOf('法') + 1 : title.indexOf('條例') + 2
  const name = title.slice(indexStart, indexEnd)
  const codeName = await Code.create({ name })
  code.content = codeName
}
// 處理法條
const processArticle = async ($, code, article) => {
  const array = $('td.text-pre').html().split('<br>')
  const articleNo = []
  const articleIndex = []
  for (const [entries, a] of array.entries()) {
    if (a[0] === '第' && a.includes('條') && !a.includes('，') && !a.includes('。')) {
      const indexEnd = a.indexOf('條')
      const number = a.slice(1, indexEnd).trim()
      articleIndex.push(entries)
      articleNo.push(number)
    }
  }
  for (let i = 0; i < articleNo.length; i++) {
    let content = ''
    if (i === articleNo.length - 1) {
      for (let j = articleIndex[i] + 1; j <= array.length - 1; j++) {
        content += array[j]
      }
    }
    for (let j = articleIndex[i] + 1; j < articleIndex[i + 1]; j++) {
      content += array[j]
    }
    article.push({
      articleNo: articleNo[i],
      codeId: code.content.id,
      content
    })
  }
}
// 廢止法規
const deleteCode = async (title) => {
  const indexStart = title.indexOf('廢止') + 2
  const indexEnd = title.includes('法') ? title.indexOf('法') + 1 : title.indexOf('條例') + 2
  const name = title.slice(indexStart, indexEnd)
  const code = await Code.findOne({ where: { name } })
  await code.update({ isAbandon: true })
}
// 增訂、刪除並修正法規
const correctCode = async ($, title) => {
  // 查找法規
  const array = ['修正', '增訂', '刪除', '、', '並']
  array.forEach(a => { title = title.replace(a, '') })
  const indexEnd = title.includes('法') ? title.indexOf('法') + 1 : title.indexOf('條例') + 2
  const name = title.slice(0, indexEnd)
  const code = {}
  code.content = await Code.findOne({ where: { name } })
  // 查找法條
  const article = []
  const articleCreate = []
  processArticle($, code, article)// 處理法條
  await Promise.all(
    article.map(
      async (article) => {
        const articleFinded = await Article.findOne({ where: { articleNo: article.articleNo, codeId: article.codeId } })
        //  新增法條
        if (articleFinded === null) {
          articleCreate.push(article)
        // 修正或刪除法條
        } else {
          await articleFinded.update({ content: article.content })
        }
      }
    )
  )
  // 新增法條
  await Article.bulkCreate(articleCreate)
}
module.exports = { updateLaw }
