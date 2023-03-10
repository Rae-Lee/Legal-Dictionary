const express = require('express')
const router = express.Router()
const keywordsController = require('../../controllers/keywords')
router.get('/:id', keywordsController.getKeyword)
router.get('/:id/references', keywordsController.getReferences)
router.get('/:id/articles', keywordsController.getArticles)
router.get('/top', keywordsController.getTopKeywords)
module.exports = router