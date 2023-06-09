const express = require('express')
const adminController = require('../../controllers/admin')
const { validatedAdminLogin } = require('../../middleware/validator')
const { authenticated, authenticatedAdmin } = require('../../middleware/authenticate')
const router = express.Router()
router.post('/login', validatedAdminLogin, adminController.login)
router.get('/users', authenticated, authenticatedAdmin, adminController.getUsers)
router.delete('/users/:id', authenticated, authenticatedAdmin, adminController.suspendUser)
router.put('/users/:id', authenticated, authenticatedAdmin, adminController.unsuspendUser)
module.exports = router
