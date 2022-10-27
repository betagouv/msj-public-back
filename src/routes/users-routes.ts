import express from 'express';
import basicAuth from '../utils/basic-auth';
import usersController from '../controllers/users-controller'

const router = express.Router()

router.post('/signup', usersController.signup)
router.post('/login', usersController.login)
router.post('/reset-password', usersController.resetPassword)
router.get('/:msjId/cpip', usersController.getCpip)

// Specific endpoint for calls from the agents app
router.post('/invite', basicAuth, usersController.invite)

export default router;
