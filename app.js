const express = require('express')
const app = express()
if (process.env.NODE_ENV.trim() !== 'production') {
  require('dotenv').config()
}

const port = process.env.NODE_PORT || 8080
const passport = require('./config/passport')
const cors = require('cors')
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
}

const routes = require('./routes')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors(corsOptions))
app.use(passport.initialize())

app.use(routes)
app.listen(port, () => console.log(`It is listening on http://localhost:${port}`))
module.exports = app
