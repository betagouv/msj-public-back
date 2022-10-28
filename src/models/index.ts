import { Sequelize } from 'sequelize-typescript'

import { getEnv } from '../utils/env'
import User from './user'

console.log(getEnv('DATABASE_URL'))
const sequelize = new Sequelize({
  database: 'ppsmj',
  dialect: 'postgres',
  username: 'ppsmj',
  password: 'MonSuiviJustice2022',
  models: [User] // or [Player, Team],
})

export default sequelize
