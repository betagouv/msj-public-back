const express = require('express')

const basicAuth = require('../utils/basic-auth')

const usersController = require('../controllers/users-controller')

const router = express.Router()

router.post('/signup', usersController.signup)
router.post('/login', usersController.login)

// Specific endpoint for calls from the agents app
router.get('/invite', basicAuth, usersController.invite)

module.exports = router
