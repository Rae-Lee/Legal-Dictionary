const express = require('express')
const router = express.Router()
const notesController = require('../../controllers/notes')
router.delete('/:id', notesController.deleteNote)
router.put('/:id', notesController.editNote)
module.exports = router
