const fetch = require('node-fetch')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const getField = async (url) => {
  const fieldArray = []
  const response = await fetch(url)
  const pageText = await response.text()
  const dom = new JSDOM(pageText)
  const field = dom.window.document.querySelectorAll('#form1 > #main > #Law-Container > #Law-Content1 > #pagebox > #law-search > table > tbody > tr > td > #LawClass > li > .item')
  field.forEach(f => fieldArray.push(f.textContent))
  return fieldArray
}
module.exports = { getField }
