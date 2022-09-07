const crypto = require('crypto')
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
  const { phone, msjId } = req.body

  let messageText = ''

  const buf = crypto.randomBytes(10)
  const invitationToken = buf.toString('hex')
  const currentDate = new Date(2022, 1, 1, 1)
  const invitationTokenExpirationDate = new Date(currentDate.getTime() + 60 * 60 * 24 * 1000)

  try {
    const convict = await db.sequelize.transaction(async () => {
      const user = await db.User.findOne({
        where: { phone: req.body.phone },
        defaults: {
          phone,
          msjId,
          invitationToken,
          invitationTokenExpirationDate

        }
      })
      return user
    })

    if (convict) {
      messageText = 'Bonjour, votre compte Mon Suivi Justice vous attend toujours. Pour y accéder et suivre vos rendez-vous justice, cliquez sur le lien suivant et choisissez votre mot de passe:'
    } else {
      messageText = 'Bonjour, votre compte Mon Suivi Justice a été créé. Pour y accéder et suivre vos rendez-vous avec la Justice, cliquez sur le lien suivant et choisissez votre mot de passe:'
    }

    const invitationSmsData = {
      destinationAddress: phone,
      messageText,
      originatorTON: '1',
      originatingAddress: process.env.SMS_SENDER,
      maxConcatenatedMessages: 10
    }

    const sms = new SMSService(invitationSmsData)
    sms.send()
    res.status(200).json({ message: 'Invitation sent' })
  } catch (error) {
    next(error)
  }
}

exports.login = login
exports.signup = signup
exports.invite = invite
