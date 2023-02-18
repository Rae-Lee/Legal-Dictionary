const fetch = require('node-fetch')
const cheerio = require('cheerio')
const webdriver = require('selenium-webdriver')
const { Builder, Browser, By, until } = webdriver
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
    const judXpath  = processVerditType(judType)
    await inputSingleVerdit(driver, judXpath, judYear, judCase, judNo)
  }
}  

const openDriver = async () => {
  try {
    const driver = await new Builder().forBrowser(Browser.CHROME).build()
    await driver.manage().window().setRect({ width: 1280, height: 800, x: 0, y: 0 })// 固定視窗大小
    return driver
  } catch (err) {
    console.log(err)
  }
}
const processVerditName = (referenceName) => {
   const judYear = referenceName.slice(referenceName.indexOf('院')+ 1, referenceName.indexOf('年'))
  const judCase = referenceName.slice(referenceName.indexOf('度') + 1, referenceName.indexOf('字'))
  const judNo = referenceName.slice(referenceName.indexOf('第') + 1, referenceName.indexOf('號'))
  return { judYear, judCase, judNo } 
}
const processVerditType = (judType) => {
  // 勾選案件類別
  let judXpath
  switch (judType) {
    case '刑事':
      judXpath='//*[@id="vtype_M"]/input' 
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

getReference('最高法院110年度台上大字第5765號刑事裁定')