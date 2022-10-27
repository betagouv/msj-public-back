import express from 'express';
import appointmentsController from '../controllers/appointments-controller'

const checkAuth = require('../middleware/check-auth')

const router = express.Router()

router.use(checkAuth)

router.get('/:msjId', appointmentsController.getUserAppointments)

export default router;
