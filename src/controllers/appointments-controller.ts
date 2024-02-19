import { NextFunction, Response } from 'express'
import axios from 'axios'

import HttpError from '../utils/http-error'
import { getEnv } from '../utils/env'
import { RequestWithUser } from '../middleware/check-auth'

const getUserAppointments = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const msjId = req.userData?.userId ?? ''
  if (msjId === '') {
    const error = new HttpError(
      "Une erreur s'est produite lors de la récupération des convocations",
      401
    )
    return next(error)
  }
  const url = `${getEnv('AGENTS_APP_API_URL')}/convicts/${msjId}`
  const username = getEnv('AGENTS_APP_BASIC_AUTH_USERNAME')
  const password = getEnv('AGENTS_APP_BASIC_AUTH_PASSWORD')

  const headers = {
    Authorization:
      'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
    'Content-type': 'application/json'
  }

  let appointments

  try {
    const response = await axios.get(url, {
      headers
    })

    appointments = response.data.appointments
  } catch (err) {
    const error = new HttpError(
      "Une erreur s'est produite lors de la récupération des convocations",
      500
    )
    return next(error)
  }

  res.status(201).json(appointments)
}

export { getUserAppointments }
