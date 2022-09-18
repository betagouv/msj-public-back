// const db = require('../models')
const HttpError = require('../utils/http-error')
const axios = require('axios')

const APPOINTMENTS_LIST = [
  {
    id: '1',
    date: 'Vendredi 15 Septembre 10h00',
    place: 'SPIP 92'
  },
  {
    id: '2',
    date: 'Vendredi 15 Septembre 10h00',
    place: 'SPIP 92'
  },
  {
    id: '3',
    date: 'Vendredi 15 Septembre 10h00',
    place: 'SPIP 92'
  }
]

const getUserAppointments = async (req, res, next) => {
  const msjId = req.params.msjId
  console.log(msjId)

  const url = `${process.env.AGENTS_APP_DOMAIN}/convicts/${msjId}`
  const username = process.env.AGENTS_APP_BASIC_AUTH_USERNAME
  const password = process.env.AGENTS_APP_BASIC_AUTH_PASSWORD

  const headers = {
    Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
    'Content-type': 'application/json'
  }

  const response = await axios.get(url, {
    headers
  })

  console.log(response)

  res.status(201).json(APPOINTMENTS_LIST)
}

exports.getUserAppointments = getUserAppointments
