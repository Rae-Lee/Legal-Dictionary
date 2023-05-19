const { openDriver, processVerditName, processVerditType, inputSingleVerdit, submitSearchPage, loadPage } = require('../helpers/crawler-helpers')
const webdriver = require('selenium-webdriver')
const { By} = webdriver
const db = require('../models')
const { Reference, Field } = db
const crawlReference = async (paragraphs) => {
  // 爬被引用的裁判書內容
  const output = []
  for (const paragraph of paragraphs) {
    console.log(paragraph.content)
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
              await Reference.create({
                fieldId: field.id,
                content: result.content,
                quote,
                name: result.name
              })
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
module.exports = { crawlReference }
// --------------------function---------------
// 爬被引用的裁判書內容
const getReference = async (judType, referenceName) => {
  const result = {}
  const driver = await openDriver()
  if (driver) {
    const time = Math.floor(Math.random() * 4000) + 1000
    await driver.get('https://judgment.judicial.gov.tw/FJUD/Default_AD.aspx')
    await driver.sleep(time)
    const { judYear, judCase, judNo } = processVerditName(referenceName)
    const judXpath = processVerditType(judType)
    await inputSingleVerdit(driver, judXpath, judYear, judCase, judNo)
    const isOpen = await submitSearchPage(driver)
    if (isOpen) {
      // 爬裁判書的名稱及連結
      await driver.sleep(time)
      await driver.switchTo().frame(driver.findElement(By.name('iframe-data')))
      const names = await driver.findElements(By.id('hlTitle'))
      let contentSliced
      for (const name of names) {
        const link = await name.getAttribute('href')
        // 排除依法不得公開或須去識別化後公開之案件
        if (link) {
          // 排除無文字檔的裁判書
          const brief = await driver.findElement(By.className('tdCut'))
          const briefContent = await brief.getAttribute('textContent')
          if (briefContent === '全文為掃描檔') {
            contentSliced = '裁判書因年代久遠，故無文字檔'
          } else {
            // 打開連結並爬判決書內容
            console.log(link)
            const $ = await loadPage(link)
            const content = await $('.tab_content').html()
            if (content) {
              contentSliced = content.slice(0, content.lastIndexOf('日') + 1)
              break
            } else {
              contentSliced = '本判決尚未有完整裁判書內容'
              break
            }
          }
        } else {
          contentSliced = '本件為依法不得公開或須去識別化後公開之案件'
        }
      }
      driver.quit()
      result.name = referenceName
      result.content = contentSliced
      console.log(result.name)
      console.log(result.content)
    }
  }
  return result
}
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
// 被引用的裁判書分類
const getReferenceField = async (result) => {
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
  return field
}
// 找出判決內容與引用段落重疊的部分(quote)
const getReferenceQuote = async (paragraph, result) => {
  let quote = ''// 宣告重疊的部分
  if (result.content !== '裁判書因年代久遠，故無文字檔' && result.content !== '本件為依法不得公開或須去識別化後公開之案件') {
    // 判決內容整理
    let reference
    reference = result.content.replace(/<abbr[^\u4e00-\u9fa5]+>/g, '')
    reference = reference.replaceAll('</abbr>', '')
    reference = reference.replace(/\s/g, '')
    // 段落文字整理
    let paragraphs
    paragraphs = paragraph.content.replace(/<abbr[^\u4e00-\u9fa5]+>/g, '')
    paragraphs = paragraphs.replaceAll('</abbr>', '')
    // 將段落依標點符號分成數段句子
    const paragraphSplits = paragraphs.split(/[\u3002|\uff0c|\uff08|\uff09]/)
    // 查找裁判書內容與引用段落相同之處
    for (const paragraph of paragraphSplits) {
      // 若是有一致的句子則將那段落加入quote的變數中
      const index = reference.indexOf(paragraph)
      if (index !== -1) {
        const start = reference.lastIndexOf('。', index) + 1
        const end = reference.indexOf('。', index) + 1
        quote = reference.slice(start, end)
        break
      }
    }
  }
  return quote
}
