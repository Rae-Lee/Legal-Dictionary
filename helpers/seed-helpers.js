const fetch = require('node-fetch')
const cheerio = require('cheerio')
const webdriver = require('selenium-webdriver')
const { Builder, Browser, By, until } = webdriver
// 爬範圍內所有裁判書中引用的段落
const getParagraph = async (jud_type, startDate, endDate) => {
  // const driver = await openDriver()
  // if (driver) {
  //   // 打開裁判書查詢網頁
  //  await driver.get('https://judgment.judicial.gov.tw/FJUD/Default_AD.aspx')
  //  //  輸入搜尋條件
  //   const judType = '刑事'
  //   const startDate = 111-1-1
  //   const endDate = 111-1-1
  //   await inputVerdit(driver, judType, startDate, endDate)
  //   const isOpen = await submitSearchPage(driver)
  //   if (isOpen) {
  //     // 爬裁判書的名稱及連結
  //     const links = []
  //     await driver.sleep(3000)
  //     await driver.switchTo().frame(driver.findElement(By.name('iframe-data')))
  //     await getLink(links, driver)
  //     driver.quit()
  //     if (links.length) {
  //       // 打開連結並爬判決書內容
  //       for (const link of links) {
  //         const $ = await loadPage(link.link)
  //       }
  //     }
  //   }
  // }
  const paragraphs = []
  const $ = await loadPage('https://judgment.judicial.gov.tw/FJUD/data.aspx?ty=JD&id=TCDM%2c111%2c%e8%a8%b4%2c1407%2c20221230%2c1&ot=in')
  const verdit = await getVerdit($)
  if (verdit) {
    // 篩選出引用段落
    const paragraphSliced = await sliceParagraph(verdit)
    if (paragraphSliced.length) {
      for (const p of paragraphSliced) {
        const content = p.slice(0, p.lastIndexOf('參照'))
        paragraphs.push(content)
        // const referenceName = content.slice(content.lastIndexOf('（') + 1, content.indexOf('意旨'))// 被引用的裁判書名稱
        // const referenceContent = content.slice(0, content.lastIndexOf('（'))// 被引用的內容
      }
    }
  }
  return paragraphs
}
// 爬被引用的裁判書內容
const getReference = async (referenceName) => {
  let result
  const driver = await openDriver()
  if (driver) {
    // 打開裁判書查詢網頁
    await driver.get('https://judgment.judicial.gov.tw/FJUD/Default_AD.aspx')
    await driver.sleep(3000)
    const { judYear, judCase, judNo } = processVerditName(referenceName)
    const judType = referenceName.substr(-4, 2)
    const judXpath = processVerditType(judType)
    await inputSingleVerdit(driver, judXpath, judYear, judCase, judNo)
    const isOpen = await submitSearchPage(driver)
    if (isOpen) {
      // 爬裁判書的名稱及連結
      await driver.sleep(3000)
      await driver.switchTo().frame(driver.findElement(By.name('iframe-data')))
      const linkName = await driver.findElement(By.id('hlTitle'))
      const link = await linkName.getAttribute('href')
      driver.quit()
      // 打開連結並爬判決書內容
      if (link) {
        const $ = await loadPage(link)
        const content = $('.tab_content').html().toString()
        result = content.slice(0, content.lastIndexOf('日') + 1)
      }
    }
  }
  return result
}
// -----------function---------------------
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
    const submitBtn = await driver.wait(until.elementLocated(By.name('ctl00$cp_content$btnQry')), 5000)
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
  const judYear = referenceName.slice(referenceName.indexOf('院') + 1, referenceName.indexOf('年'))
  const judCase = referenceName.slice(referenceName.indexOf('度') + 1, referenceName.indexOf('字'))
  const judNo = referenceName.slice(referenceName.indexOf('第') + 1, referenceName.indexOf('號'))
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
const inputVerdit = async (driver, judType, startDate, endDate) => {
  try {
    const { judXpath } = processVerditType(judType)
    const category = await driver.wait(until.elementLocated(By.xpath(judXpath)), 5000)
    category.click()
    // 輸入裁判期間
    const s_date = startDate.split('-')
    const e_date = endDate.split('-')
    const dateStart = await driver.wait(until.elementLocated(By.name('dy1')), 5000)
    dateStart.sendKeys(s_date[0])
    await driver.findElement(By.name('dm1')).sendKeys('111')
    await driver.findElement(By.name('dd1')).sendKeys(s_date[2])
    await driver.findElement(By.name('dy2')).sendKeys(e_date[0])
    await driver.findElement(By.name('dm2')).sendKeys(e_date[1])
    await driver.findElement(By.name('dd2')).sendKeys(e_date[2])
  } catch (err) {
    console.log(err)
  }
}
// 輸入被引用的案件
const inputSingleVerdit = async (driver, judXpath, judYear, judCase, judNo) => {
  try {
    const category = await driver.wait(until.elementLocated(By.xpath(judXpath)), 5000)
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
  let pageTotal = 1
  let pageNumber = 1
  try {
    while (pageTotal !== (pageNumber - 1)) {
      await driver.sleep(3000)

      const linkNames = await driver.findElements(By.id('hlTitle'))
      for (l of linkNames) {
        const linkName = await l.getAttribute('textContent')
        const link = await l.getAttribute('href')
        if (linkName.includes('判決') && linkName.includes('訴字')) {
          links.push({ linkName, link })
        }
      }
      // 取得頁數總數
      const pageElement = await driver.findElement(By.xpath('//*[@id="plPager"]/span[1]'))
      const pageContent = await pageElement.getAttribute('textContent')
      const indexStart = pageContent.indexOf('/') + 1
      const indexEnd = pageContent.indexOf('頁')
      pageTotal = pageContent.slice(indexStart, indexEnd)
      // 跳下一頁
      const nextBtn = await driver.wait(until.elementLocated(By.id('hlNext')), 5000)
      nextBtn.click()
      pageNumber++
    }
  } catch (err) {
    console.log(err)
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
    const verdit = result.toString().split('</div>')
    return verdit
  } catch (err) {
    console.log(err)
  }
}
const sliceParagraph = async (verdit) => {
  try {
    const paragraphSliced = verdit.filter(v => v.toString().indexOf('參照') !== -1)
    return paragraphSliced
  } catch (err) {
    console.log(err)
  }
}
getReference('最高法院110年度台上大字第5765號刑事裁定')

module.exports = { getParagraph, getReference }
