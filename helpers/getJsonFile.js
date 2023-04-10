const fs = require('fs')
const { getParagraph } = require('./seed-helpers')
const getJsonFile = async () => {
  const judType = '刑事'
  const startDate = '111-1-1'
  const endDate = '111-6-30'
  // 爬範圍內所有刑事裁判書中引用的段落
  let result = crawlParagraph(judType, startDate, endDate)
  // 將資料存進paragraph.json檔案
  convertDataToJson(result)
  result = null
}
getJsonFile()
// ---------------function--------------------------
// 爬範圍內所有刑事裁判書中引用的段落
const crawlParagraph = async (judType, startDate, endDate) => {
  const paragraphs = await getParagraph(judType, startDate, endDate)
  const result = paragraphs.map(p => {
    return {
      verdit: p.verditName,
      content: p.content,
      created_at: new Date(),
      updated_at: new Date()
    }
  })
  return result
}

// 將資料存進paragraph.json檔案
const convertDataToJson = async (result) => {
  const json = JSON.stringify(result)
  const data = `{"data":${json}}`
  fs.writeFile('paragraph.json', data, function (err) {
    if (err) { console.log(err) } else { console.log('Write operation complete.') }
  })
}
