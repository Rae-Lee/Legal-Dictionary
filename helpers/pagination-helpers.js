

const countTotalPage = (dataAmount) => {
  const dataPerPage = 10 // 一頁出現10筆資料
  const totalPage = Math.ceil(dataAmount / dataPerPage)
  return totalPage
}

module.exports = countTotalPage
