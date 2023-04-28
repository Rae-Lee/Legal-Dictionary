const db = require('../models')
const { Paragraph, Reference } = db
const findQuote = async () => {
  const result = []
  const paragraphs = await Paragraph.findAll()
  const judType = '刑事'
  for (const paragraph of paragraphs) {
    const referenceNames = paragraph.content.match(/\d{2,3}[\u4e00-\u9fa5]{5,7}\d+[\u4e00-\u9fa5]/g)
    for (const referenceName of referenceNames) {
      const name = await getReferenceName(referenceName, judType)
      if (name) {
        const reference = await Reference.findOne({ where: { name } })
        if (reference) {
          result.push({
            paragraph_id: paragraph.id,
            reference_id: reference.id
          })
        }
      }
    }
  }
  return result
}
module.exports = {
  findQuote
}
// --------------------function--------------
// 搜尋被引用判決名稱
const getReferenceName = async (referenceName, judType) => {
  const judYear = referenceName.match(/\d+/g)[0]
  const judNo = referenceName.match(/\d+/g)[1]
  let name = ''// 被引用判決名稱
  if ((referenceName.includes('台上大') || referenceName.includes('臺上大')) && judYear >= 39) {
    name = `最高法院 ${judYear} 年度 台上大 字第 ${judNo} 號${judType}裁定`
  } else if ((referenceName.includes('台上') || referenceName.includes('臺上')) && judYear >= 39) {
    name = `最高法院 ${judYear} 年度 台上 字第 ${judNo} 號${judType}判決`
  }
  return name
}
