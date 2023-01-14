const express = require('express')
const app = express()
if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv').config()
}
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`It is listening on http://localhost:${port}`))
