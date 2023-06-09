const express = require('express')
const router = express.Router()
const usersController = require('../../controllers/users')
const { authenticated, authenticatedProfile, authenticatedUser } = require('../../middleware/authenticate')
const { validatedRegister, validateEditSetting, validatedLogin } = require('../../middleware/validator')

router.get('/current_user', authenticated, usersController.getCurrentUser)
router.post('/register', validatedRegister, usersController.register)
router.post('/login', validatedLogin, usersController.login)
router.get('/:id/likes', authenticated, authenticatedUser, authenticatedProfile, usersController.getLikes)
router.get('/:id/notes', authenticated, authenticatedUser, authenticatedProfile, usersController.getNotes)
router.get('/:id', authenticated, authenticatedUser, authenticatedProfile, usersController.getProfile)
router.put('/:id', authenticated, authenticatedUser, authenticatedProfile, validateEditSetting, usersController.editProfile)
module.exports = router
