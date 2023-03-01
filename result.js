const db = require('./models')
const { Paragraph, Reference } = db
const getQuote = async () => {
  // const paragraph = await Paragraph.findByPk(1)
  // const reference = await Reference.findByPk(1)
  // // 被引用的段落
  // const paragraphSplits = paragraph.content.split(/[\uff1b|\u3002|\uff0c]/)
  // const resultContent = reference.content.replace(/\s*/g, '')
  // const endIndex = paragraph.content.lastIndexOf('（')
  // for (const paragraphSplit of paragraphSplits) {
  //   // 查找被引用裁判書內容與引用段落相同之處           
  //   if (resultContent.includes(paragraphSplit)) {
  //     const startIndex = paragraph.content.search(paragraphSplit)
  //     const answer = paragraph.content.slice(startIndex, endIndex) + '。'
  //     console.log(answer)
  //     return
  //   }
  // }
  const a = '在客觀上<abbr rel="M" id="%e8%b6%b3%e4%bb%a5%e5%bc%95%e8%b5%b7%e4%b8%80%e8%88%ac%e5%90%8c%e6%83%85" class="termhover">足以引起一般同情</abbr>'
  const answer = a.replace(/<abbr[^\u4e00-\u9fa5]+>/g, '')
  const answer2 = answer.replace('</abbr>', '')

  console.log(answer2)
}

getQuote()

