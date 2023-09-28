/* eslint-disable @typescript-eslint/no-misused-promises */
// see https://github.com/standard/eslint-config-standard-with-typescript/issues/613

import express from 'express'
import * as appointmentsController from '../controllers/appointments-controller'
import checkAuth from '../middleware/check-auth'

const router = express.Router()

router.use(checkAuth)

router.get('/:msjId', appointmentsController.getUserAppointments)

export default router
