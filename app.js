const express = require('express')
const app = express()
if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv').config()
}
const port = process.env.PORT || 3000
const { updateLaw } = require('./helpers/lawUpdate-helpers')
const routes = require('./routes')
app.use(express.urlencoded({ extended: true}))

// 更新法規異動
// let updateDate = '112-01-06'// json檔建立時間
// updateLaw(updateDate)

app.use(routes)
app.listen(port, () => console.log(`It is listening on http://localhost:${port}`))
