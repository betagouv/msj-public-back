import app from './app'
import sequelize from './models'
import { getEnv } from './utils/env'

const port = getEnv('PORT', '5000')
;(async () => {
  await sequelize.sync()

  app.listen(port)
})().catch((err) => console.error(err))
