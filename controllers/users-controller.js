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
  console.log(req.body)
  // Will receive the call from the agent app

  const data = {
    destinationAddress: '330684424921',
    messageText: 'test sms invitation ppsmj'
  }

  const sms = new SMSService(data)
  sms.send()

  res.json({ message: 'Invitation sent' })
}

exports.login = login
exports.signup = signup
exports.invite = invite
