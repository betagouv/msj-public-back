const express = require('express')
const appointmentsController = require('../controllers/appointments-controller')

const checkAuth = require('../middleware/check-auth')

const router = express.Router()

router.use(checkAuth)

router.get('/:msjId', appointmentsController.getUserAppointments)

module.exports = router
