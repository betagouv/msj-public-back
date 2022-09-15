// const db = require('../models')
const HttpError = require('../utils/http-error')

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
  res.status(201).json(APPOINTMENTS_LIST)
}

exports.getUserAppointments = getUserAppointments
