import { Sequelize } from 'sequelize-typescript'

import { getEnv } from '../utils/env'
import User from './user'

const sequelize = new Sequelize(getEnv('DATABASE_URL')!, {
  dialect: 'postgres',
  models: [User] // or [Player, Team],
})

export default sequelize
