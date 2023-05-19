process.env.NODE_ENV = 'development'
const fs = require('fs')
const { crawlParagraph } = require('./crawlParagraph')
const { findParagraphArticle } = require('./findParagraphArticle')
const { findQuote } = require('./findQuote')
const { crawlReference } = require('./crawlReference')

const crawler = async () => {
  // 爬範圍內所有刑事裁判書中引用的段落
  const paragraphResult = await crawlParagraph()
  // 將段落資料存進json檔案
  convertDataToJson(paragraphResult, './data/paragraph.json')
  // 爬裁判書段落中所引用的裁判完整內容
  const paragraphs = require('../data/reference.json').data
  const referenceResult = await crawlReference(paragraphs)
  // 將內容資料存進json檔案
  convertDataToJson(referenceResult, './data/reference.json')
}

// 待paragraph、reference及article加入db後再整理裁判書段落中有關法條的索引對照
const finder = async () => {
  const paragraphArticleResult = await findParagraphArticle()
  // 將資料存進json檔案
  convertDataToJson(paragraphArticleResult, './data/paragraphArticle.json')
  const quoteResult = await findQuote()
  // 將資料存進json檔案
  convertDataToJson(quoteResult, './data/quote.json')
}

const convertDataToJson = async (result, file) => {
  const json = JSON.stringify(result)
  const data = `{"data":${json}}`
  fs.writeFile(file, data, function (err) {
    if (err) {
      console.log(err)
    } else {
      console.log('Write operation complete.')
    }
  })
}
finder()
module.exports = { crawler, finder }
