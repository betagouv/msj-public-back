import * as Sentry from '@sentry/node'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as SentryTracing from '@sentry/tracing'
import app from './app'
import sequelize from './models'
import { getEnv } from './utils/env'

Sentry.init({
  dsn: getEnv('SENTRY_DSN'),

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0
})

const port = getEnv('PORT', '5000')
;(async () => {
  await sequelize.sync()

  app.listen(port)
})().catch((err) => console.error(err))
