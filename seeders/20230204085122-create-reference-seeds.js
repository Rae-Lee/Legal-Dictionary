'use strict'
const { getReference } = require('../helpers/seed-helpers')
const db = require('../models')
const { Paragraph, Field, Reference } = db
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 爬被引用的裁判書內容
    const paragraphs = await Paragraph.findAll({ attributes: ['content'] })
    for (const paragraph of paragraphs) {
      // 被引用的裁判書名稱及類型
      const judType = '刑事'
      const referenceNames = paragraph.content.match(/\d{2,3}[\u4e00-\u9fa5]{5,7}\d+[\u4e00-\u9fa5]/g)
      for (const referenceName of referenceNames) {
        let isCrawled // 排除已經爬過的裁判書
        const judYear = referenceName.match(/\d+/g)[0]
        const judNo = referenceName.match(/\d+/g)[1]
        if (referenceName.includes('台上大') || referenceName.includes('臺上大')) {
          const name = `最高法院 ${judYear} 年度 台上大 字第 ${judNo} 號${judType}裁定`
          console.log(name)
          isCrawled = await Reference.findOne({ where: { name } })
        } else if (referenceName.includes('台上') || referenceName.includes('臺上')) {
          const name = `最高法院 ${judYear} 年度 台上 字第 ${judNo} 號${judType}判決`
          console.log(name)
          isCrawled = await Reference.findOne({ where: { name } })
        }
        // 若還未爬過開始爬蟲
        if (!isCrawled) {
          if (referenceName.includes('台上') || referenceName.includes('臺上')) {
            // 被引用的裁判書內容
            const result = await getReference(judType, referenceName)
            if (result.name) {
            // 被引用的裁判書分類
              let field
              if (result.name.includes('刑事判決')) {
                field = await Field.findOne({
                  where: { name: '刑事判決' }
                })
              } else if (result.name.includes('民事判決')) {
                field = await Field.findOne({
                  where: { name: '民事判決' }
                })
              } else if (result.name.includes('行政判決')) {
                field = await Field.findOne({
                  where: { name: '行政判決' }
                })
              } else if ((result.name.includes('台上大') || result.name.includes('臺上大')) && result.name.includes('刑事')) {
                field = await Field.findOne({
                  where: { name: '大法庭刑事裁定' }
                })
              } else if (result.name.includes('台上大') && result.name.includes('民事')) {
                field = await Field.findOne({
                  where: { name: '大法庭民事裁定' }
                })
              }
              // 被引用的段落
              let quote = paragraph.content
              if (result.content !== '裁判書因年代久遠，故無文字檔') {
                const endIndex = paragraph.content.lastIndexOf('（')// 被引用的段落結尾
                console.log(endIndex)
                const resultContent = result.content.replace(/[^\u4e00-\u9fa5]/g, '')
                const paragraphSplits = paragraph.content.split(/[\uff08|\uff09|\u3008|	\u3009|\u300a|\u300b|\u300c\u300d|\u300e|\u300f|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|	\u3001|\u3010|\u3011|\uff0c|\u3002|\uff1f|\uff01|\uff1a|\uff1b|\u201c|\u201d|\u2018|\u2019]/)
                for (const paragraphSplit of paragraphSplits) {
                // 查找被引用裁判書內容與引用段落相同之處
                  const htmlStartSliced = paragraphSplit.replace(/<abbr[^\u4e00-\u9fa5]+>/g, '')
                  const htmlEndSliced = htmlStartSliced.replaceAll('</abbr>', '')
                  console.log(htmlEndSliced)
                  if (resultContent.includes(htmlEndSliced)) {
                    const startIndex = paragraph.content.search(paragraphSplit)// 被引用的段落開頭
                    console.log(startIndex)
                    quote = paragraph.content.slice(startIndex, endIndex) + '。'
                    break
                  }
                }
              }
              // 資料存到References table
              await queryInterface.bulkInsert('References', [{
                field_id: field.id,
                content: result.content,
                quote,
                name: result.name,
                created_at: new Date(),
                updated_at: new Date()
              }], {})
            }
          }
        }
      }
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('References', null, {})
  }
}
