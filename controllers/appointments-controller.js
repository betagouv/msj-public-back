const HttpError = require('../utils/http-error')
const axios = require('axios')

const getUserAppointments = async (req, res, next) => {
  const msjId = req.params.msjId
  console.log(msjId)

  const url = `${process.env.AGENTS_APP_API_URL}/convicts/${msjId}`
  const username = process.env.AGENTS_APP_BASIC_AUTH_USERNAME
  const password = process.env.AGENTS_APP_BASIC_AUTH_PASSWORD

  const headers = {
    Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
    'Content-type': 'application/json'
  }

  let appointments

  try {
    const response = await axios.get(url, {
      headers
    })

    appointments = response.data.appointments
  } catch (err) {
    const error = new HttpError("Une erreur s'est produite lors de la récupération des rendez-vous", 500)
    return next(error)
  }

  res.status(201).json(appointments)
}

exports.getUserAppointments = getUserAppointments
