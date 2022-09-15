const express = require('express')
const appointmentsController = require('../controllers/appointments-controller')

const router = express.Router()

// TODO protect this route with JWT token
router.get('/:msjId', appointmentsController.getUserAppointments)

module.exports = router
