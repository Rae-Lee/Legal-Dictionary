const fetch = require('node-fetch')
const cheerio = require('cheerio')
const webdriver = require('selenium-webdriver')
const { Builder, Browser, By, until } = webdriver
const db = require('../models')
const { Field } = db
// 爬範圍內所有裁判書中引用的段落
const getParagraph = async (judType, startDate, endDate) => {
  const paragraphs = []
  const driver = await openDriver()
  if (driver) {
    // 打開裁判書查詢網頁
    await driver.get('https://judgment.judicial.gov.tw/FJUD/Default_AD.aspx')
    await driver.sleep(3000)
    //  輸入搜尋條件
    const judXpath = processVerditType(judType)
    const s_date = startDate.split('-')
    const e_date = endDate.split('-')
    await inputVerdit(driver, judXpath, s_date, e_date)
    const isOpen = await submitSearchPage(driver)
    if (isOpen) {
      const links = []
      // 爬裁判書的名稱及連結
      await driver.sleep(3000)
      await driver.switchTo().frame(driver.findElement(By.name('iframe-data')))
      await getLink(links, driver)
      driver.quit()
      if (links.length) {
        // 打開連結並爬判決書內容
        for (const link of links) {
          const $ = await loadPage(link.link)
          const verdit = await getVerdit($)
          if (verdit) {
            // 篩選出引用段落
            await sliceParagraph(link, paragraphs, verdit)
          }
        }
      }
    }
  }
  return paragraphs
}
// 爬被引用的裁判書內容
const getReference = async (judType, referenceName) => {
  const result = {}
  const driver = await openDriver()
  if (driver) {
    // 打開裁判書查詢網頁
    await driver.get('https://judgment.judicial.gov.tw/FJUD/Default_AD.aspx')
    await driver.sleep(3000)
    const { judYear, judCase, judNo } = processVerditName(referenceName)
    const judXpath = processVerditType(judType)
    await inputSingleVerdit(driver, judXpath, judYear, judCase, judNo)
    const isOpen = await submitSearchPage(driver)
    if (isOpen) {
      // 爬裁判書的名稱及連結
      await driver.sleep(3000)
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
            const $ = await loadPage(link)
            const content = $('.tab_content').html()
            contentSliced = content.slice(0, content.lastIndexOf('日') + 1)
            break
          }
        } else {
          contentSliced = '本件為依法不得公開或須去識別化後公開之案件'
        }
      }
      driver.quit()
     
      result.name = referenceName
      result.content = contentSliced
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
  console.log(name)
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
  console.log(field)
  return field
}
// 被引用的段落
const getReferenceQuote = async (paragraph, result) => {
  let quote = paragraph.content
  if (result.content !== '裁判書因年代久遠，故無文字檔' && result.content !== '本件為依法不得公開或須去識別化後公開之案件') {
    const endIndex = paragraph.content.lastIndexOf('（')// 被引用的段落結尾
    console.log(endIndex)
    const resultContent = result.content.replace(/[^\u4e00-\u9fa5]/g, '')
    const paragraphSplits = paragraph.content.split(/[\uff08|\uff09|\u3008|	\u3009|\u300a|\u300b|\u300c\u300d|\u300e|\u300f|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|	\u3001|\u3010|\u3011|\uff0c|\u3002|\uff1f|\uff01|\uff1a|\uff1b|\u201c|\u201d|\u2018|\u2019]/)
    for (const paragraphSplit of paragraphSplits) {
      // 查找被引用裁判書內容與引用段落相同之處
      console.log(paragraphSplit)
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
  return quote
}
//  -----------function--------------------
const openDriver = async () => {
  try {
    const driver = await new Builder().forBrowser(Browser.CHROME).build()
    await driver.manage().window().setRect({ width: 1280, height: 800, x: 0, y: 0 })// 固定視窗大小
    return driver
  } catch (err) {
    console.log(err)
  }
}
// 送出查詢頁面
const submitSearchPage = async (driver) => {
  try {
    // 送出查詢
    const submitBtn = await driver.wait(until.elementLocated(By.name('ctl00$cp_content$btnQry')), 3000)
    submitBtn.click()
    // 檢查是否成功跳轉
    await driver.wait(until.elementLocated(By.xpath('//*[@id="form1"]/div[3]/div/div[1]/div')), 5000)
    return true
  } catch (err) {
    console.log(err)
    return false // 終止後續的爬蟲
  }
}
const processVerditName = (referenceName) => {
  const judYear = referenceName.match(/\d+/g)[0]
  let judCase
  if (referenceName.includes('台上大')) {
    judCase = '台上大'
  } else {
    judCase = '台上'
  }
  const judNo = referenceName.match(/\d+/g)[1]
  return { judYear, judCase, judNo }
}
//
const processVerditType = (judType) => {
  // 勾選案件類別
  let judXpath
  switch (judType) {
    case '刑事':
      judXpath = '//*[@id="vtype_M"]/input'
      break
    case '民事':
      judXpath = '//*[@id="vtype_V"]/input'
      break
    case '行政':
      judXpath = '//*[@id="vtype_A"]/input'
      break
  }
  return judXpath
}
// 輸入要爬蟲的案件
const inputVerdit = async (driver, judXpath, startDate, endDate) => {
  try {
    // 勾選裁判類型
    const category = await driver.wait(until.elementLocated(By.xpath(judXpath)), 3000)
    category.click()
    // 輸入裁判期間
    const dateStart = await driver.wait(until.elementLocated(By.name('dy1')), 3000)
    dateStart.sendKeys(startDate[0])
    await driver.findElement(By.name('dm1')).sendKeys(startDate[1])
    await driver.findElement(By.name('dd1')).sendKeys(startDate[2])
    await driver.findElement(By.name('dy2')).sendKeys(endDate[0])
    await driver.findElement(By.name('dm2')).sendKeys(endDate[1])
    await driver.findElement(By.name('dd2')).sendKeys(endDate[2])
  } catch (err) {
    console.log(err)
  }
}
// 輸入被引用的案件
const inputSingleVerdit = async (driver, judXpath, judYear, judCase, judNo) => {
  try {
    const category = await driver.wait(until.elementLocated(By.xpath(judXpath)), 3000)
    category.click()
    // 輸入裁判字號
    const judgeYear = await driver.wait(until.elementLocated(By.name('jud_year')), 5000)
    judgeYear.sendKeys(judYear)
    await driver.findElement(By.name('jud_case')).sendKeys(judCase)
    await driver.findElement(By.name('jud_no')).sendKeys(judNo)
    await driver.findElement(By.name('jud_no_end')).sendKeys(judNo)
  } catch (err) {
    console.log(err)
  }
}
// 取得頁面上的判決名稱及連結
const getLink = async (links, driver) => {
  // 取得頁數總數
  const pageElement = await driver.findElement(By.xpath('//*[@id="plPager"]/span[1]'))
  const pageContent = await pageElement.getAttribute('textContent')
  const indexStart = pageContent.indexOf('/') + 1
  const indexEnd = pageContent.indexOf('頁')
  const pageTotal = pageContent.slice(indexStart, indexEnd)
  let pageNumber = 1
  try {
    while (pageTotal !== pageNumber) {
      await driver.sleep(3000)
      const linkNames = await driver.findElements(By.id('hlTitle'))
      for (const name of linkNames) {
        const linkName = await name.getAttribute('textContent')
        const link = await name.getAttribute('href')
        if (linkName.includes('判決') && linkName.includes('訴') && link) {
          links.push({ linkName, link })
        }
      }
      // 跳下一頁
      const nextBtn = await driver.wait(until.elementLocated(By.id('hlNext')), 5000)
      nextBtn.click()
      pageNumber++
    }
  } catch (err) {
  }
}
// 載入頁面
const loadPage = async (link) => {
  try {
    const response = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/ 537.36(KHTML, like Gecko) Chrome/ 57.0.2987.133 Safari / 537.36' } })
    const pageText = await response.text()
    const $ = cheerio.load(pageText)
    return $
  } catch (err) {
    console.log(err)
  }
}
const getVerdit = async ($) => {
  try {
    const result = $('.tab_content').html()
    const verdit = result.split('</div>')
    return verdit
  } catch (err) {
    console.log(err)
  }
}
const sliceParagraph = async (link, paragraphs, verdit) => {
  try {
    const paragraphSliced = verdit.filter(v => v.toString().indexOf('參照') !== -1)
    for (const p of paragraphSliced) {
      // 篩選有引用裁判書名稱及「參照」詞彙的段落
      const results = p.split('參照')
      results.splice((results.length - 1), 1)
      const resultFiltered = results.filter(r => r.search(/\d{2,3}[\u4e00-\u9fa5]{5,7}\d+[\u4e00-\u9fa5]/g) !== -1)
      for (const r of resultFiltered) {
        const content = r.replace(/^[^\u4e00-\u9fa5]+/, '')
        paragraphs.push({
          verditName: link.linkName,
          content
        })
      }
    }
  } catch (err) {
    console.log(err)
  }
}
module.exports = { getParagraph, getReference, getReferenceName, getReferenceField, getReferenceQuote }
