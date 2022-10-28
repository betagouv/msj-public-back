import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import axios from 'axios'

import User from '../models/user'
import HttpError from '../utils/http-error'
import SMSService from '../services/sms-service'

const signup = async (req: Request, res: Response, next: NextFunction) => {
  const { password, invitationToken } = req.body
  let invitedUser: User | null = null
  let token

  try {
    invitedUser = await User.findOne({
      where: { invitationToken }
    })
    if (invitedUser != null) {
      // TODO: investigate differences between bcrypt and crypto
      //  TODO: check invitationTokenExpirationDate expiration date (should be 24h)
      let hashedPassword
      try {
        hashedPassword = await bcrypt.hash(password, 12)
      } catch (err) {
        const error = new HttpError("Impossible de créer l'utilisateur", 500)
        return next(error)
      }

      try {
        token = jwt.sign(
          { id: invitedUser.id, phone: invitedUser.phone },
          process.env.JWT_SECRET || '',
          { expiresIn: '1h' }
        )
      } catch (err) {
        const error = new HttpError(
          "Une erreur s'est produite lors de la connexion, contactez l'administrateur du site",
          500
        )
        return next(error)
      }

      invitedUser.password = hashedPassword

      try {
        await invitedUser.save()
      } catch (err) {
        const error = new HttpError(
          "Une erreur s'est produite lors de l'enregistrement, contactez l'administrateur du site",
          500
        )
        return next(error)
      }
    } else {
      const error = new HttpError(
        "Nous n'avons pas trouvé d'invitation associée à votre numéro",
        404
      )
      return next(error)
    }
  } catch (err) {
    const error = new HttpError(
      "Une erreur s'est produite lors de la création de votre compte",
      500
    )
    return next(error)
  }

  res.status(201).json({
    userId: invitedUser?.id,
    phone: invitedUser?.phone,
    token,
    msjId: invitedUser?.msjId,
    firstName: invitedUser?.firstName,
    lastName: invitedUser?.lastName
  })
}

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, password } = req.body
  const phoneWithAreaCode = phone.replace(/\D|^0+/g, '+33')

  let user

  // Check user existence
  try {
    user = await User.findOne({
      where: { phone: phoneWithAreaCode }
    })
  } catch (err) {
    console.error(err)
    const error = new HttpError(
      "Une erreur s'est produite lors de la connexion, contactez l'administrateur du site",
      500
    )
    return next(error)
  }

  if (user == null) {
    const error = new HttpError(
      'Le numéro de téléphone ou le mot de passe ne sont pas valides',
      404
    )
    return next(error)
  }

  // Check password
  let isValidPassword = false
  try {
    if (user.password) {
      isValidPassword = await bcrypt.compare(password, user.password)
    }
  } catch (err) {
    const error = new HttpError(
      "Une erreur s'est produite lors de la connexion, contactez l'administrateur du site",
      500
    )
    return next(error)
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Le numéro de téléphone ou le mot de passe ne sont pas valides',
      404
    )
    return next(error)
  }

  let token
  try {
    token = jwt.sign(
      { id: user.id, phone: user.phone },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )
  } catch (err) {
    const error = new HttpError(
      "Une erreur s'est produite lors de la connexion, contactez l'administrateur du site",
      500
    )
    return next(error)
  }

  res.status(201).json({
    userId: user.id,
    phone: user.phone,
    msjId: user.msjId,
    token,
    firstName: user.firstName,
    lastName: user.lastName
  })
}

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phone } = req.body

  const phoneWithAreaCode = phone.replace(/\D|^0+/g, '+33')

  let user: User | null

  const buf = crypto.randomBytes(10)
  const invitationToken = buf.toString('hex')
  // const invitationTokenExpirationDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24)

  // Check user existence
  try {
    user = await User.findOne({
      where: { phone: phoneWithAreaCode }
    })
  } catch (err) {
    const error = new HttpError(
      "Une erreur s'est produite lors de votre demande de modification de mot de passe, contactez l'administrateur du site",
      500
    )
    return next(error)
  }

  if (user == null) {
    const error = new HttpError(
      'Le numéro de téléphone ne correspond à aucun utilisateur',
      404
    )
    return next(error)
  }

  try {
    user.set({
      invitationToken
    })
    user = await user.save()
  } catch (err) {
    const error = new HttpError(
      "Une erreur s'est produite lors de votre demande de modification de mot de passe, contactez l'administrateur du site",
      500
    )
    return next(error)
  }

  const invitationUrl = `${process.env.FRONT_INVITATION_URL}?token=${invitationToken}`
  const messageText = `Bonjour, vous avez demandé à modifier votre mot de passe sur Mon suivi Justice. Pour effectuer ce changement, cliquez sur le lien suivant : ${invitationUrl}`

  const resetPasswordSMSData = {
    destinationAddress: phoneWithAreaCode,
    messageText,
    originatorTON: '1',
    originatingAddress: process.env.SMS_SENDER,
    maxConcatenatedMessages: 10
  }

  const sms = new SMSService(resetPasswordSMSData)
  sms.send()
  res.status(200).json({ message: 'Invitation sent' })
}

const invite = async (req: Request, res: Response, next: NextFunction) => {
  const {
    phone,
    msj_id: msjId,
    first_name: firstName,
    last_name: lastName
  } = req.body

  console.log('body de la  requête', req.body)

  // TODO : validation sur la présence de ces paramètres.
  let messageText = ''

  const buf = crypto.randomBytes(10)
  const invitationToken = buf.toString('hex')
  // const invitationTokenExpirationDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24)

  try {
    const [user, created] = await User.findOrCreate({
      where: { phone: req.body.phone },
      defaults: {
        phone,
        firstName,
        lastName,
        msjId
      }
    })

    user.set({
      invitationToken
    })

    await user.save()

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
    console.log('erreur invitation sms', err)
    return next(err)
  }
}

const getCpip = async (req: Request, res: Response, next: NextFunction) => {
  const msjId = req.params.msjId

  const url = `${process.env.AGENTS_APP_API_URL}/convicts/${msjId}/cpip`
  const username = process.env.AGENTS_APP_BASIC_AUTH_USERNAME
  const password = process.env.AGENTS_APP_BASIC_AUTH_PASSWORD

  const headers = {
    Authorization:
      'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
    'Content-type': 'application/json'
  }

  let cpip

  try {
    const response = await axios.get(url, {
      headers
    })

    cpip = response.data
  } catch (err) {
    const error = new HttpError('Impossible de trouver un cpip référent', 404)
    return next(error)
  }

  res.status(201).json(cpip)
}

export { login, signup, invite, resetPassword, getCpip }