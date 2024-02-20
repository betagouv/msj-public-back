/* eslint-disable @typescript-eslint/no-misused-promises */
// see https://github.com/standard/eslint-config-standard-with-typescript/issues/613

import express from 'express'
import basicAuth from '../utils/basic-auth'
import checkAuth from '../middleware/check-auth'
import * as usersController from '../controllers/users-controller'
import { createRateLimiter } from '../middleware/rate-limiter'

const router = express.Router()
const usersLimiter = createRateLimiter(100, 3 * 60 * 1000) // Par exemple, 100 requêtes / 15 minutes

router.post('/signup', usersController.signup)
router.post('/login', usersController.login)
router.post('/reset-password', usersController.resetPassword)

router.get('/cpip', usersLimiter, checkAuth, usersController.getCpip)

// Specific endpoint for calls from the agents app
router.post('/invite', basicAuth, usersController.invite)
router.patch('/update-phone', basicAuth, usersController.updateUserPhoneNumber)
router.delete('/:msjId', basicAuth, usersController.deleteUser)

export default router
