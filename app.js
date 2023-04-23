const express = require('express')
const app = express()
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV.trim() === 'development') {
  require('dotenv').config()
}
if (process.env.NODE_ENV.trim() === 'test') {
  require('dotenv').config({ path: `${process.cwd()}/.env-test` })
}
const port = process.env.NODE_PORT || 8080
const passport = require('./config/passport')
const cors = require('cors')
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
}
const { updateLaw } = require('./helpers/lawUpdate-helpers')
const routes = require('./routes')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
app.use(passport.initialize())

// 更新法條
// const updateDate = '112-01-06'
// updateLaw(updateDate)

app.use(routes)
app.listen(port, () => console.log(`It is listening on http://localhost:${port}`))
module.exports = app
