const express = require('express')
const router = express.Router()
const { authenticated, authenticatedUser, authenticatedNote } = require('../middleware/authenticate')
const { validatedNote } = require('../middleware/validator')
const users = require('./modules/users')
const admin = require('./modules/admin')
const keywords = require('./modules/keywords')
const references = require('./modules/references')
const notes = require('./modules/notes')
const errorHandler = require('../middleware/error-handler')

router.use('/api/v1/users', users)
router.use('/api/v1/admin', admin)
router.use('/api/v1/keywords', keywords)
router.use('/api/v1/references', references)
router.use('/api/v1/notes', authenticated, authenticatedUser, authenticatedNote, validatedNote, notes)
router.use('/api/v1', errorHandler)
module.exports = router
