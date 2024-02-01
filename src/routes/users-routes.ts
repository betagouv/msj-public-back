/* eslint-disable @typescript-eslint/no-misused-promises */
// see https://github.com/standard/eslint-config-standard-with-typescript/issues/613

import express from 'express'
import basicAuth from '../utils/basic-auth'
import * as usersController from '../controllers/users-controller'

const router = express.Router()

router.post('/signup', usersController.signup)
router.post('/login', usersController.login)
router.post('/reset-password', usersController.resetPassword)
router.get('/cpip', usersController.getCpip)

// Specific endpoint for calls from the agents app
router.post('/invite', basicAuth, usersController.invite)
router.patch('/update-phone', basicAuth, usersController.updateUserPhoneNumber)

export default router
