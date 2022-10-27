import * as dotenv from 'dotenv'
import express, { Express, Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import * as Sentry from '@sentry/node'
// eslint-disable-next-line no-unused-vars
import * as SentryTracing from '@sentry/tracing'

import appointmentsRoutes from './routes/appointments-routes'
import usersRoutes from './routes/users-routes'
import HttpError from './utils/http-error'

dotenv.config()

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0
})

const app: Express = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(helmet())

app.use((req: Request, res: Response, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONT_DOMAIN || '')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next()
})

app.use('/api/users', usersRoutes)
app.use('/api/appointments', appointmentsRoutes)

app.use((req: Request, res: Response, next) => {
  const error = new HttpError('Could not find this route.', 404)
  return next(error)
})

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error)
  }

  res.status(error.code || 500)
  res.json({ message: error.message || 'unknown error occured' })
})

const port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('Mon Suivi Justice back-end listening on', port)
})
