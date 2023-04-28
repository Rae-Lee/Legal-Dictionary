const db = require('../models')
const { Code, Article, Paragraph } = db
const findParagraphArticle = async () => {
  const result = []
  const paragraphs = await Paragraph.findAll()
  for (const paragraph of paragraphs) {
    // 尋找段落中的法條id
    const articleId = await getArticleId(paragraph)
    if (articleId) {
      for (const id of articleId) {
        result.push({
          article_id: id,
          paragraph_id: paragraph.id
        })
      }
    }
  }
  return result
}

module.exports = { findParagraphArticle }
// --------------------function--------------
// 尋找段落中的法條
const getArticleId = async (paragraph) => {
  const articleId = []
  // 找出條號
  const content = paragraph.content.replace(/\s/g, '')
  const numbers = content.match(/\u7b2c{1}\d+\u689D{1}/g)
  if (numbers) {
    // 找出法條名稱
    const articleParagraph = content.split(/(?<=\u6cd5)|(?<=\u689d\u4f8b)/g)
    const codes = await Code.findAll()
    for (const number of numbers) {
      for (let i = 0; i <= articleParagraph.length - 1; i++) {
        if (articleParagraph[i].includes(number)) {
          let articleName
          let index = i - 1
          while (articleName === undefined && index >= 0) {
            articleName = codes.find(code => {
              const name = code.name.replace('中華民國', '')
              return articleParagraph[index].includes(name)
            })
            index--
          }
          if (articleName) {
            const articleNo = number.match(/\d+/)[0]
            const codeId = articleName.id
            // 找出法條id
            const article = await Article.findOne({ where: { articleNo, codeId } })
            if (!articleId.includes(article.id)) {
              articleId.push(article.id)
            }
          }
        }
      }
    }
  }
  return articleId
}
