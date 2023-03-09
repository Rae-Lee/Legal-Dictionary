const express = require('express')
const router = express.Router()
const referencesController = require('../../controllers/references')
router.get('/:id', referencesController.getReference)
module.exports = router