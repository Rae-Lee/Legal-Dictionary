const express = require('express')
const router = express.Router()
const usersController = require('../../controllers/users')
const { authenticated, authenticatedProfile, authenticatedUser } = require('../../middleware/authenticate')
const { validatedRegister, validateEditSetting } = require('../../middleware/validator')

router.post('/register', validatedRegister, usersController.register)
router.post('/login', usersController.login)
router.get('/:id/likes', authenticated, authenticatedUser, authenticatedProfile, usersController.getLikes)
router.get('/:id/notes', authenticated, authenticatedUser, authenticatedProfile, usersController.getNotes)
router.get('/:id', authenticated, authenticatedUser, authenticatedProfile, usersController.getProfile)
router.put('/:id', authenticated, authenticatedUser, authenticatedProfile, validateEditSetting, usersController.editProfile)

module.exports = router