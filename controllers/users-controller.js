const db = require('../models')

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

const invite = async (req, res, next) => {
  const invitationSmsData = {
    destinationAddress: req.body.phone,
    messageText: "invitation depuis l'application agent ppsmj",
    originatorTON: '1',
    originatingAddress: process.env.SMS_SENDER,
    maxConcatenatedMessages: 10
  }

  try {
    const result = await db.sequelize.transaction(async () => {
      const user = await db.User.findOne({ where: { phone: req.body.phone } })
      return user
    })

    console.log('user trouvé en BDD', result)

    // If the execution reaches this line, the transaction has been committed successfully
    // `result` is whatever was returned from the transaction callback (the `user`, in this case)
  } catch (error) {
    console.log(error)

    // If the execution reaches this line, an error occurred.
    // The transaction has already been rolled back automatically by Sequelize!
  }

  const sms = new SMSService(invitationSmsData)
  sms.send()

  res.json({ message: 'Invitation sent' })
}

exports.login = login
exports.signup = signup
exports.invite = invite
