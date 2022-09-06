const SMSService = require('../services/sms-service')

const signup = (req, res, next) => {
  console.log(req.body)

  const { phone, password, invitationToken } = req.body

  console.log(phone, password, invitationToken)

  res.status(201).json({ message: 'Signed up' })
}

const login = (req, res, next) => {
  const { phone, password } = req.body

  console.log('login', phone, password)

  res.json({ message: 'Logged in' })
}

const invite = (req, res, next) => {
  const invitationSmsData = {
    destinationAddress: req.body.phone,
    messageText: "invitation depuis l'application agent ppsmj",
    originatorTON: '1',
    originatingAddress: process.env.SMS_SENDER,
    maxConcatenatedMessages: 10
  }

  const sms = new SMSService(invitationSmsData)
  sms.send()

  res.json({ message: 'Invitation sent' })
}

exports.login = login
exports.signup = signup
exports.invite = invite
