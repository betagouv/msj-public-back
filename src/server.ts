import * as dotenv from 'dotenv'
import * as Sentry from '@sentry/node'
// eslint-disable-next-line no-unused-vars
import * as SentryTracing from '@sentry/tracing'
import app from './app'
import sequelize from './models'

dotenv.config()

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0
})
const port = process.env.PORT || 5000

sequelize
  .sync()
  .then(() => {
    app.listen(port, function () {
      console.log('Mon Suivi Justice back-end listening on', port)
    })
  })
  .catch((err) => console.error(err))
