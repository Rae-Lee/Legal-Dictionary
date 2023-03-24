const express = require('express')
const router = express.Router()
const keywordsController = require('../../controllers/keywords')
const likesController = require('../../controllers/likes')
const notesController = require('../../controllers/notes')
const { validatedKeyword } = require('../../middleware/validator')
const { authenticated, authenticate } = require('../../middleware/authenticate')
// 瀏覽關鍵字內容
router.get('/top', keywordsController.getTopKeywords)
router.get('/:id/references', validatedKeyword, keywordsController.getReferences)
router.get('/:id/articles', validatedKeyword, keywordsController.getArticles)
router.get('/:id/notes', authenticated, authenticate.authenticatedUser, validatedKeyword, keywordsController.getNotes)
router.get('/:id', validatedKeyword, keywordsController.getKeyword)

// 收藏
router.post('/:id/likes', authenticated, authenticate.authenticatedUser, validatedKeyword, likesController.addLike)
router.delete('/:id/likes', authenticated, authenticate.authenticatedUser, validatedKeyword, likesController.deleteLike)
// 筆記
router.post('/:id/notes', authenticated, authenticate.authenticatedUser, validatedKeyword, notesController.addNote)

// 新增關鍵字
router.post('/', keywordsController.addKeyword)
module.exports = router