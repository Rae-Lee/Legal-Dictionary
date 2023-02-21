const fetch = require('node-fetch')
const cheerio = require('cheerio')
const webdriver = require('selenium-webdriver')
const { Builder, Browser, By, until } = webdriver
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
  const result = []
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
      const linkName = await driver.findElement(By.id('hlTitle'))
      const link = await linkName.getAttribute('href')
      driver.quit()
      // 打開連結並爬判決書內容
      if (link) {
        const $ = await loadPage(link)
        const content = $('.tab_content').html().toString()
        const contentSliced = content.slice(0, content.lastIndexOf('日') + 1)
        result.push({
          content: contentSliced,
          name: linkName
        })
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
const inputVerdit = async (driver, judXpath, startDate, endDate) => {
  try {
    // 勾選裁判類型
    const category = await driver.wait(until.elementLocated(By.xpath(judXpath)), 5000)
    category.click()
    // 輸入裁判期間
    const dateStart = await driver.wait(until.elementLocated(By.name('dy1')), 5000)
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
        if (linkName.includes('判決') && linkName.includes('訴')) {
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
      const result = p.split('參照')
      result.splice((result.length - 1), 1)
      for (const r of result) {
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
module.exports = { getParagraph, getReference }

