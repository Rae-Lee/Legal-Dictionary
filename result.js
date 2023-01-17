let law = require('./ChLaw.json')
law = law.Laws.slice(0, 1)
const db = require('./models')
const { Code } = db
const result = []
async function getArticle () {
  // 匯入法規內容
  for (const l of law) {
    // 尋找法規在資料庫中的id
    const code = await Code.findOne({ where: { name: l.LawName } })

    // 刪除法規中編章節項次
    const content = l.LawArticles.filter(c =>
      c.ArticleType === 'A'
    )
    // 資料整理到result陣列中
    for (const a of content) {
      const number = a.ArticleNo.slice(1, a.ArticleNo.length - 1)
      result.push({
        article_no: number,
        content: a.ArticleContent,
        code_id: code.toJSON().id,
        created_at: new Date(),
        updated_at: new Date()
      })
    }
  }
  return result
}
getArticle()

