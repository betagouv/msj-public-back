import { Sequelize } from 'sequelize-typescript'
import User from './user'

const sequelize = new Sequelize({
  database: process.env.DATABASE_URL,
  dialect: 'postgres',
  models: [User]
})

export default sequelize
