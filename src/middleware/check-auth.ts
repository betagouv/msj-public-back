import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

import HttpError from '../utils/http-error'

export type RequestWithUser = Request & { userData?: { userId: string } }

const checkAuth = (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next()
  }
  try {
    const token = req?.headers?.authorization?.split(' ')[1]

    if (!token) {
      throw new Error("Cette opération n'est pas authorisée")
    }
    const decodedToken: JwtPayload = jwt.verify(
      token,
      process.env.JWT_SECRET || ''
    ) as JwtPayload
    req.userData = { userId: decodedToken.userId }
    next()
  } catch (error) {
    const err = new HttpError("Cette opération n'est pas autorisée", 401)
    return next(err)
  }
}

export default checkAuth