const db = require('./models')
const { Code, Article } = db
const getQuote = async () => {
  const articleId = []
  const a = '第二審法院認為上訴書狀未敘述理由或上訴有刑事訴訟法依法第4條、第5條'
  const numbers = a.match(/\u7b2c{1}\d+\u689D{1}/g)
  const articleParagraph = a.split(/(?<=\u6cd5)/g)
  const codes = await Code.findAll()
  for (const number of numbers) {
    for (let i = 0; i <= articleParagraph.length - 1; i++) {
      if (articleParagraph[i].includes(number)) {
        let articleName
        let index = i - 1
        while (articleName === undefined) {
          articleName = codes.find(code => { return articleParagraph[index].includes(code.name) })
          index--
        }
        
        const articleNo= number.match(/\d+/)[0]
        const codeId= articleName.id
        const article= await Article.findOne({ where: { articleNo, codeId } })
        articleId.push(article.id)
      }
    }
    
  }
  
}

getQuote()
