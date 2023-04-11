const fs = require('fs')
const { getParagraph, getReference, getReferenceName, getReferenceField, getReferenceQuote, getArticleId } = require('./seed-helpers')
const db = require('../models')
const { Paragraph, Reference } = db
const getParagraphJsonFile = async () => {
  const judType = '刑事'
  const startDate = '111-1-1'
  const endDate = '111-6-30'
  // 爬範圍內所有刑事裁判書中引用的段落
  let result = crawlParagraph(judType, startDate, endDate)
  // 將資料存進paragraph.json檔案
  convertDataToJson(result, 'paragraph.json')
  result = null
}
const getReferenceJsonFile = async () => {
  let result = crawlReference()
  convertDataToJson(result, 'reference.json')
  result = null
}
const getParagraphArticleFile = async () => {
  let result = findParagraphArticle()
  convertDataToJson(result, 'paragraphArticle.json')
  result = null
}
getParagraphArticleFile()
getParagraphJsonFile()
getReferenceJsonFile()
// ---------------function--------------------------
// 爬範圍內所有刑事裁判書中引用的段落
const crawlParagraph = async (judType, startDate, endDate) => {
  const paragraphs = await getParagraph(judType, startDate, endDate)
  const result = paragraphs.map(p => {
    return {
      verdit: p.verditName,
      content: p.content
    }
  })
  return result
}
const crawlReference = async () => {
  // 爬被引用的裁判書內容
  const paragraphs = await Paragraph.findAll({ attributes: ['content'] })
  const output = []
  for (const paragraph of paragraphs) {
    // 被引用的裁判書名稱及類型
    const judType = '刑事'
    const referenceNames = paragraph.content.match(/\d{2,3}[\u4e00-\u9fa5]{5,7}\d+[\u4e00-\u9fa5]/g)
    for (const referenceName of referenceNames) {
      if ((referenceName.includes('台上') || referenceName.includes('臺上'))) {
        // 排除已經爬過的裁判書
        const name = await getReferenceName(referenceName, judType)
        if (name) {
          const isCrawled = await Reference.findOne({ where: { name } })
          let isOutput = false
          for (const o of output) {
            if (o.name === name) {
              isOutput = true
              break
            }
          }
          // 若還未爬過開始爬蟲
          if (!isCrawled && !isOutput) {
            // 被引用的裁判書內容
            const result = await getReference(judType, name)
            if (result.content) {
              // 被引用的裁判書分類
              const field = await getReferenceField(result)
              // 被引用的段落
              const quote = await getReferenceQuote(paragraph, result)
              // 資料存到output
              output.push({
                field_id: field.id,
                content: result.content,
                quote,
                name: result.name
              })
            }
          }
        }
      }
    }
  }
  return output
}
const findParagraphArticle = async () => {
  let result = []
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
// 將資料存進paragraph.json檔案
const convertDataToJson = async (result, file) => {
  const json = JSON.stringify(result)
  const data = `{"data":${json}}`
  fs.writeFile(file, data, function (err) {
    if (err) { console.log(err) } else { console.log('Write operation complete.') }
  })
}
