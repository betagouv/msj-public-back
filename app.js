const express = require('express')
const helmet = require('helmet')

const HttpError = require('./utils/http-error')

const usersRoutes = require('./routes/users-routes')
const appointmentsRoutes = require('./routes/appointments-routes')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(helmet())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONT_DOMAIN)
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next()
})

app.use('/api/users', usersRoutes)
app.use('/api/appointments', appointmentsRoutes)

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404)
  return next(error)
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
