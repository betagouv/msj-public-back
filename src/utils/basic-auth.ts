import { Request, Response, NextFunction } from 'express'
import { getEnv } from './env'
import HttpError from './http-error'

export default function basicAuth (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authorizationHeader = req.headers.authorization ?? ''
  // Check if headers are present
  if (!authorizationHeader.includes('Basic ')) {
    res.status(401).json({ message: 'Missing Authorization Header' })
  }

  // Check credentials
  const base64Credentials = req?.headers?.authorization?.split(' ')[1] ?? ''
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
  const [username, password] = credentials.split(':')

  if (
    username !== getEnv('HTTP_BASIC_AUTH_USER') ||
    password !== getEnv('HTTP_BASIC_AUTH_PSWD')
  ) {
    throw new HttpError(
      'Invalid Authentication Credentials',
      401,
      undefined,
      true
    )
  }

  next()
}
