const crypto = require('crypto')
const db = require('../models')
const SMSService = require('../services/sms-service')
const HttpError = require('../utils/http-error')

const signup = async (req, res, next) => {
  const { password, invitationToken } = req.body

  try {
    await db.sequelize.transaction(async () => {
      const [user] = await db.User.findOne({
        where: { invitationToken }
      })

      if (user) {
        user.set({
          password
        })
      } else {
        const error = new HttpError("Nous n'avons pas trouvé d'invitation associée à ce numéro")
        return next(error)
      }
    })
  } catch (err) {
    const error = new HttpError('Une erreur s\'est produite lors de la création de votre compte')
    return next(error)
  }

  // TODO : renvoyer le user si il a bien été créé
  res.status(201).json({ message: 'Signed up' })
}

const login = (req, res, next) => {
  const { phone, password } = req.body

  console.log('login', phone, password)

  res.json({ message: 'Logged in' })
}

const invite = async (req, res, next) => {
  const { phone, msjId } = req.body

  //  validation sur la présence de ces paramètres.

  let messageText = ''

  const buf = crypto.randomBytes(10)
  const invitationToken = buf.toString('hex')
  const currentDate = new Date(2022, 1, 1, 1)
  const invitationTokenExpirationDate = new Date(currentDate.getTime() + 60 * 60 * 24 * 1000)

  try {
    const { created } = await db.sequelize.transaction(async () => {
      let [user, created] = await db.User.findOrCreate({
        where: { phone: req.body.phone },
        defaults: {
          phone,
          msjId
        }
      })

      user.set({
        invitationToken,
        invitationTokenExpirationDate
      })

      user = await user.save()

      return { user, created }
    })

    const invitationUrl = `${process.env.FRONT_INVITATION_URL}?token=${invitationToken}`

    if (created) {
      messageText = `Bonjour, votre compte Mon Suivi Justice a été créé. Pour y accéder et suivre vos rendez-vous avec la Justice, cliquez sur le lien suivant et choisissez votre mot de passe: ${invitationUrl}`
    } else {
      messageText = `Bonjour, votre compte Mon Suivi Justice vous attend toujours. Pour y accéder et suivre vos rendez-vous justice, cliquez sur le lien suivant et choisissez votre mot de passe: ${invitationUrl}`
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
  } catch (err) {
    return next(err)
  }
}

exports.login = login
exports.signup = signup
exports.invite = invite
