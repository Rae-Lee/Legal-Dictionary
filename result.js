// const referenceName = content.slice(content.lastIndexOf('（') + 1, content.indexOf('意旨'))// 被引用的裁判書名稱
// const referenceContent = content.slice(0, content.lastIndexOf('（'))// 被引用的內容

// const db = require('../models')
// const { paragraph } = db
// const content = await paragraph.findAll({ attributes: ['content'] })
// console.log(content)
const { getReference } = require('./helpers/seed-helpers')
const hi = async () => {
  const judType = '刑事'
  const referenceName = '最高法院97年度台上字第892號判決'
  const content = await getReference(judType, referenceName)
  console.log(content)
}
hi()