import express, { Express, Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import * as Sentry from '@sentry/node'

import appointmentsRoutes from './routes/appointments-routes'
import usersRoutes from './routes/users-routes'
import { getEnv } from './utils/env'
import HttpError from './utils/http-error'
import { get } from 'http'

const app: Express = express()

Sentry.init({
  dsn: getEnv('SENTRY_DSN'),

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0
})

app.use(Sentry.Handlers.requestHandler());

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(helmet({
  hsts: {
    maxAge: 60 * 60 * 24 * 365, // 1 year in seconds
    includeSubDomains: true, // Must be true to pass the HSTS preload list requirements
    preload: true
  }
}))

app.use((req: Request, res: Response, next) => {
  res.setHeader('Access-Control-Allow-Origin', getEnv('FRONT_DOMAIN'))
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next()
})

app.use('/api/users', usersRoutes)
app.use('/api/appointments', appointmentsRoutes)

app.use(Sentry.Handlers.errorHandler());

app.use((req: Request, res: Response, next) => {
  const error = new HttpError('Could not find this route.', 404)
  return next(error)
})

app.use(
  (
    error: { code?: number, message?: string },
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (res.headersSent) {
      return next(error)
    }

    res.status(error.code ?? 500)
    res.json({ message: error.message ?? 'unknown error occured' })
  }
)

export default app
