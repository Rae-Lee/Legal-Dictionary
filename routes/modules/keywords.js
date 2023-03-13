const express = require('express')
const router = express.Router()
const keywordsController = require('../../controllers/keywords')
router.get('/top', keywordsController.getTopKeywords)
router.get('/:id/references', keywordsController.getReferences)
router.get('/:id/articles', keywordsController.getArticles)
router.get('/:id', keywordsController.getKeyword)
router.post('/', keywordsController.addKeyword)
module.exports = router