process.env.NODE_ENV = 'development'
const fs = require('fs')
const db = require('./models')
const { Reference } = db
const answer = async () => {
  const result = await Reference.findAll({ attributes: ['name', 'content', 'quote', 'fieldId'], raw: true, nest: true })
  const results = result.map(r => {
    return {
      name: r.name,
      content: r.content,
      quote: r.quote,
      field_id: r.fieldId
    }
  })
  const json = JSON.stringify(results)
  const data = `{"data":${json}}`
  fs.writeFile('./data/reference.json', data, function (err) {
    if (err) { console.log(err) } else { console.log('Write operation complete.') }
  })
}
answer()