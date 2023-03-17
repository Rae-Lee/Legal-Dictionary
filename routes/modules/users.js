const express = require('express')
const router = express.Router()
const usersController = require('../../controllers/users')
const { authenticated, authenticate } = require('../../middleware/authenticate')
const { validatedRegister, validateEditSetting } = require('../../middleware/validator')

router.post('/register', validatedRegister, usersController.register)
router.post('/login', usersController.login)
router.get('/:id/likes', authenticated,  authenticate.authenticatedProfile, usersController.getLikes)
router.get('/:id/notes', authenticated,  authenticate.authenticatedProfile, usersController.getNotes)
router.get('/:id', authenticated,  authenticate.authenticatedProfile, usersController.getProfile)
router.put('/:id', authenticated,  authenticate.authenticatedProfile, validateEditSetting, usersController.editProfile)

module.exports = router