const bcrypt = require('bcryptjs/dist/bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const db = require('../models')
const SMSService = require('../services/sms-service')
const HttpError = require('../utils/http-error')

const signup = async (req, res, next) => {
  const { password, invitationToken } = req.body
  let invitedUser
  let token

  try {
    await db.sequelize.transaction(async () => {
      invitedUser = await db.User.findOne({
        where: { invitationToken }
      })
      if (invitedUser) {
        // TODO: investigate differences between bcrypt and crypto
        //  TODO: check invitationTokenExpirationDate expiration date (should be 24h)
        let hashedPassword
        try {
          hashedPassword = await bcrypt.hash(password, 12)
        } catch (err) {
          const error = new HttpError('Impossible de créer l\'utilisateur', 500)
          return next(error)
        }

        try {
          token = jwt.sign({ id: invitedUser.id, phone: invitedUser.phone }, process.env.JWT_SECRET, { expiresIn: '1h' })
        } catch (err) {
          const error = new HttpError("Une erreur s'est produite lors de la connexion, contactez l'administrateur du site", 500)
          return next(error)
        }

        invitedUser.set({
          password: hashedPassword
        })

        try {
          await invitedUser.save()
        } catch (err) {
          console.log(err)
          const error = new HttpError("Une erreur s'est produite lors de l'enregistrement, contactez l'administrateur du site", 500)
          return next(error)
        }
      } else {
        const error = new HttpError("Nous n'avons pas trouvé d'invitation associée à votre numéro", 404)
        return next(error)
      }
    })
  } catch (err) {
    console.log(err)
    // const error = new HttpError("Une erreur s'est produite lors de la création de votre compte", 500)
    return next(err.message)
  }

  res.status(201).json({ userId: invitedUser.id, phone: invitedUser.phone, token })
}

const login = async (req, res, next) => {
  const { phone, password } = req.body

  const phoneWithAreaCode = phone.replace(/\D|^0+/g, '+33')

  let user

  // Check user existence
  try {
    await db.sequelize.transaction(async () => {
      user = await db.User.findOne({
        where: { phone: phoneWithAreaCode }
      })
    })
  } catch (err) {
    console.log('erreur trouvage du user', err)
    const error = new HttpError("Une erreur s'est produite lors de la connexion, contactez l'administrateur du site", 500)
    return next(error)
  }

  if (!user) {
    const error = new HttpError('Le numéro de téléphone ou le mot de passe ne sont pas valides', 404)
    return next(error)
  }

  // Check password
  let isValidPassword = false
  try {
    isValidPassword = await bcrypt.compare(password, user.password)
  } catch (err) {
    const error = new HttpError("Une erreur s'est produite lors de la connexion, contactez l'administrateur du site", 500)
    return next(error)
  }

  if (!isValidPassword) {
    const error = new HttpError('Le numéro de téléphone ou le mot de passe ne sont pas valides', 404)
    return next(error)
  }

  let token
  try {
    token = jwt.sign({ id: user.id, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '1h' })
  } catch (err) {
    const error = new HttpError("Une erreur s'est produite lors de la connexion, contactez l'administrateur du site", 500)
    return next(error)
  }

  res.status(201).json({ userId: user.id, phone: user.phone, msjId: user.msjId, token })
}

const invite = async (req, res, next) => {
  const { phone, msjId } = req.body

  //  validation sur la présence de ces paramètres.

  let messageText = ''

  const buf = crypto.randomBytes(10)
  const invitationToken = buf.toString('hex')
  const invitationTokenExpirationDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24)

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
