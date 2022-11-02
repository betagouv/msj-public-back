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
console.log(`DEFAULT PORT: ${process.env.PORT}`)
const port = getEnv('PORT', '5000')
console.log(`PORT: ${port}`)

sequelize
  .sync()
  .then(() => {
    app.listen(port, function () {
      console.log('Mon Suivi Justice back-end listening on', port)
    })
  })
  .catch((err) => {
    console.error('==== DB ERROR ===')
    console.log(err)
    console.error('==== ENDOF DB ERROR ===')
  })
