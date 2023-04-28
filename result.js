const fs = require('fs')
const db = require('./models')
const { Paragraph } = db
const answer = async () => {
  const result = await Paragraph.findAll({ attributes: ['verdit', 'content'], raw: true, nest: true})
  const results = result.map(r => {
    return {
      verdit: r.verdit,
      content: r.content
    }
  })
  const json = JSON.stringify(results)
  const data = `{"data":${json}}`
  fs.writeFile('./data/paragraph.json', data, function (err) {
    if (err) { console.log(err) } else { console.log('Write operation complete.') }
  })
}
answer()