const fs = require('fs')
const db = require('./models')
const { Quote } = db
const answer = async () => {
  const result = await Quote.findAll({ attributes: ['paragraphId', 'referenceId'], raw: true, nest: true })
  const results = result.map(r => {
    return {
      paragraph_id: r.paragraphId,
      reference_id: r.referenceId
    }
  })
  const json = JSON.stringify(results)
  const data = `{"data":${json}}`
  fs.writeFile('./data/quote.json', data, function (err) {
    if (err) { console.log(err) } else { console.log('Write operation complete.') }
  })
}
answer()