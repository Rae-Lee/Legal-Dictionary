const express = require('express')
const router = express.Router()
const usersController = require('../../controllers/users')
const { authenticated, authenticatedPermission } = require('../../middleware/authenticate')

router.post('/register', usersController.register)
router.post('/login', usersController.login)
router.get('/:id/likes', authenticated, authenticatedPermission, usersController.getLikes)
router.get('/:id/notes', authenticated, authenticatedPermission, usersController.getNotes)
router.get('/:id', authenticated, authenticatedPermission, usersController.getProfile)
router.put('/:id', authenticated, authenticatedPermission, usersController.editProfile)

module.exports = router