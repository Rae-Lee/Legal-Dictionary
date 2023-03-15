const express = require('express')
const router = express.Router()
const usersController = require('../../controllers/users')
const { authenticated } = require('../../middleware/authenticate')

router.post('/register', usersController.register)
router.post('/login', usersController.login)
router.get('/:id', authenticated, usersController.login)
module.exports = router