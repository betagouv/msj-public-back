/* eslint-disable @typescript-eslint/no-misused-promises */
// see https://github.com/standard/eslint-config-standard-with-typescript/issues/613

import express from 'express'
import * as appointmentsController from '../controllers/appointments-controller'
import checkAuth from '../middleware/check-auth'
import { createRateLimiter } from '../middleware/rate-limiter'

const router = express.Router()
const appointmentsLimiter = createRateLimiter(100, 15 * 60 * 1000)

router.get(
  '/',
  appointmentsLimiter,
  checkAuth,
  appointmentsController.getUserAppointments
)

export default router
