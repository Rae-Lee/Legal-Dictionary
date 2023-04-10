const express = require('express')
const app = express()
if (process.env.NODE_ENV.trim() === 'development') {
  require('dotenv').config()
}
if (process.env.NODE_ENV.trim() === 'test') {
  require('dotenv').config({ path: `${process.cwd()}/.env-test` })
}
const port = process.env.NODE_PORT || 3000
const passport = require('./config/passport')
const cors = require('cors')
const corsOptions = {
  origin: ['http://localhost', 'http://legal-dictionary-dev.ap-southeast-2.elasticbeanstalk.com'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowHeaders: ['Content-Type', 'Authorization']
}
const { updateLaw } = require('./helpers/lawUpdate-helpers')
const routes = require('./routes')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors(corsOptions))
app.use(passport.initialize())

// const updateDate = '112-01-06'
// updateLaw(updateDate)

app.use(routes)
app.listen(port, () => console.log(`It is listening on http://localhost:${port}`))
module.exports = app
