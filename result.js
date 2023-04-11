const fs = require('fs')
const db = require('./models')
const { Paragraph_article } = db
const answer = async () => {
  const result = await Paragraph_article.findAll({ attributes: ['articleId', 'paragraphId'], raw: true, nest: true})
  const results = result.map(r => {
    return {
      article_id: r.articleId,
      paragraph_id: r.paragraphId
    }
  })
  const json = JSON.stringify(results)
  const data = `{"data":${json}}`
  fs.writeFile('paragraphArticle.json', data, function (err) {
    if (err) { console.log(err) } else { console.log('Write operation complete.') }
  })
}
answer()