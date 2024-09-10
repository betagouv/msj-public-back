import { Request, Response, NextFunction } from 'express'

import HttpError from '../utils/http-error'
import * as JWTService from '../services/jwt-service'

export type RequestWithUser = Request & { userData?: { userId: number } }

const checkAuth = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  if (req.method === 'OPTIONS') {
    return next()
  }
  try {
    const token = req?.headers?.authorization?.split(' ')[1] ?? ''

    if (token === '') {
      throw new Error("Cette opération n'est pas authorisée")
    }
    const decodedToken: JWTService.TokenPayload  = JWTService.verify(token)
    req.userData = { userId: decodedToken.id }
    next()
  } catch (err) {
    const error = new HttpError("Cette opération n'est pas autorisée", 401, err, true)
    return next(error)
  }
}

export default checkAuth
