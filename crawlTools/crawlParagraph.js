const { openDriver, processVerditType, inputVerdit, submitSearchPage, loadPage } = require('../helpers/crawler-helpers')
const webdriver = require('selenium-webdriver')
const { By, until } = webdriver

const crawlParagraph = async () => {
  const judType = '刑事'
  const startDate = '111-1-1'
  const endDate = '111-1-2'
  const paragraphs = await getParagraph(judType, startDate, endDate)
  const result = paragraphs.map(p => {
    return {
      verdit: p.verditName,
      content: p.content
    }
  })
  return result
}
module.exports = { crawlParagraph }
// ---------------------function--------------------------------------
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
      let links = []
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
      links = null
    }
  }
  return paragraphs
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
// 爬判決書內容
const getVerdit = async ($) => {
  try {
    const result = $('.tab_content').html()
    const verdit = result.split('</div>')
    return verdit
  } catch (err) {
    console.log(err)
  }
}
// 篩選出引用段落
const sliceParagraph = async (link, paragraphs, verdit) => {
  try {
    console.log(link.linkName)
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
