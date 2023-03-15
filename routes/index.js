const express = require('express')
const router = express.Router()
const { authenticated } = require('../middleware/authenticate')
const users = require('./modules/users')
const keywords = require('./modules/keywords')
const references = require('./modules/references')
const notes = require('./modules/notes')

router.use('/api/v1/users', users)
router.use('/api/v1/keywords', keywords)
router.use('/api/v1/references', references)
router.use('/api/v1/notes', authenticated, notes)

module.exports = router