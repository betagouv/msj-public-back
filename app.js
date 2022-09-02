const express = require('express')
const helmet = require('helmet')
const db = require('./models/index')
// const bodyParser = require('body-parser')

const HttpError = require('./utils/http-error')

const usersRoutes = require('./routes/users-routes')

const app = express()

app.use(helmet())
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404)
  next(error)
})

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error)
  }
  res.status(error.code || 500)
  res.json({ message: error.message || 'unknown error occured' })
})

const port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('Mon Suivi Justice back-end listening on', port)
})

const testConnection = async () => {
  try {
    await db.sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

testConnection()
