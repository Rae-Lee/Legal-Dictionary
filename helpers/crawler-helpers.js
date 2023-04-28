const fetch = require('node-fetch')
const cheerio = require('cheerio')
const webdriver = require('selenium-webdriver')
const { Builder, Browser, By, until } = webdriver
const dns = require('dns')

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

// 載入頁面
const loadPage = async (link) => {
  try {
    dns.setDefaultResultOrder('ipv4first')
    const response = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/ 537.36(KHTML, like Gecko) Chrome/ 57.0.2987.133 Safari / 537.36' } })
    const pageText = await response.text()
    const $ = cheerio.load(pageText)
    return $
  } catch (err) {
    console.log(err)
  }
}

module.exports = { openDriver, processVerditName, processVerditType, inputSingleVerdit, inputVerdit, submitSearchPage, loadPage }
