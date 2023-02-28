
const paragraph = 'kkk'

const referenceNames = paragraph.search(/\d{2,3}[\u4e00-\u9fa5]{5,7}\d+[\u4e00-\u9fa5]/g)
console.log(referenceNames)
