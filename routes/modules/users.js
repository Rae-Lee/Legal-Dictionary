const express = require('express')
const router = express.Router()
const usersController = require('../../controllers/users')
const { authenticated, authenticatedProfile } = require('../../middleware/authenticate')

router.post('/register', usersController.register)
router.post('/login', usersController.login)
router.get('/:id/likes', authenticated, authenticatedProfile, usersController.getLikes)
router.get('/:id/notes', authenticated, authenticatedProfile, usersController.getNotes)
router.get('/:id', authenticated, authenticatedProfile, usersController.getProfile)
router.put('/:id', authenticated, authenticatedProfile, usersController.editProfile)

module.exports = router