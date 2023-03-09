const express = require('express')
const router = express.Router()
const users = require('./modules/users')
const keywords = require('./modules/keywords')
const references = require('./modules/references')

router.use('/api/v1/users', users)
router.use('/api/v1/keywords', keywords)
router.use('/api/v1/references', references)

module.exports = router