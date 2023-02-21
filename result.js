const a = '123。參照'
const b = a.replace(/^[^\u4e00-\u9fa5]/, '')
console.log(b)