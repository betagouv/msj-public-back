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
  } catch (error) {
    const err = new HttpError(
      "Cette opération n'est pas autorisée",
      401,
      error instanceof Error ? error : undefined,
      true
    )
    return next(err)
  }
}

export default checkAuth
