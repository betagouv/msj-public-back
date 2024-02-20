import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import User from '../models/user'
import SMSService from '../services/sms-service'
import { getEnv } from '../utils/env'
import HttpError from '../utils/http-error'
import { getCpip as getCpipRequest, validateInvitation } from '../utils/msj-api'
import { InviteRequestBody } from '../models/interfaces'
import { RequestWithUser } from '../middleware/check-auth'

const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
          { id: invitedUser.msjId, phone: invitedUser.phone },
          getEnv('JWT_SECRET'),
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
        try {
          await validateInvitation(invitedUser.msjId)
        } catch (error) {
          console.error(
            "Une erreur s'est produite lors de la mise a jour de l'invitation: ",
            error
          )
        }
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

const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    isValidPassword = await bcrypt.compare(password, user.password ?? '')
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
      { id: user.msjId, phone: user.phone },
      getEnv('JWT_SECRET'),
      {
        expiresIn: '1h'
      }
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
): Promise<void> => {
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

  const invitationUrl = `${getEnv(
    'FRONT_INVITATION_URL'
  )}?token=${invitationToken}`
  const messageText = `Bonjour, vous avez demandé à modifier votre mot de passe sur Mon suivi Justice. Pour effectuer ce changement, cliquez sur le lien suivant : ${invitationUrl}`

  const resetPasswordSMSData = {
    destinationAddress: phoneWithAreaCode,
    messageText,
    originatorTON: '1',
    originatingAddress: getEnv('SMS_SENDER'),
    maxConcatenatedMessages: 10
  }

  const sms = new SMSService(resetPasswordSMSData)
  sms.send()
  res.status(200).json({ message: 'Invitation sent' })
}

const invite = async (
  req: Request<{}, {}, InviteRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const {
    phone,
    msj_id: msjId,
    first_name: firstName,
    last_name: lastName
  } = req.body

  // TODO : validation sur la présence de ces paramètres.
  let messageText = ''

  const buf = crypto.randomBytes(10)
  const invitationToken = buf.toString('hex')
  // const invitationTokenExpirationDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24)

  try {
    const [user, created] = await User.findOrCreate({
      where: { phone, msjId },
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

    const invitationUrl = `${getEnv(
      'FRONT_INVITATION_URL'
    )}?token=${invitationToken}`

    if (created) {
      messageText = `Bonjour, votre compte Mon Suivi Justice a été créé. Pour y accéder et suivre vos convocations devant le JAP et le SPIP, cliquez sur le lien suivant et choisissez votre mot de passe: ${invitationUrl}`
    } else {
      messageText = `Bonjour, votre compte Mon Suivi Justice vous attend toujours. Pour y accéder et suivre vos convocations devant le JAP et le SPIP, cliquez sur le lien suivant et choisissez votre mot de passe: ${invitationUrl}`
    }

    const invitationSmsData = {
      destinationAddress: phone,
      messageText,
      originatorTON: '1',
      originatingAddress: getEnv('SMS_SENDER'),
      maxConcatenatedMessages: 10
    }

    const sms = new SMSService(invitationSmsData)
    sms.send()
    res.status(200).json({ message: 'Invitation sent' })
  } catch (err) {
    return next(err)
  }
}

const getCpip = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const msjId = req.userData?.userId ?? ''
  if (msjId === '') {
    const error = new HttpError(
      "Une erreur s'est produite lors de la récupération des convocations",
      401
    )
    return next(error)
  }
  let cpip

  try {
    cpip = await getCpipRequest(msjId)
  } catch (err) {
    console.error(err)
    const error = new HttpError('Impossible de trouver un cpip référent', 404)
    return next(error)
  }

  res.status(201).json(cpip)
}

const updateUserPhoneNumber = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { phone }: { phone?: string } = req.body
  const { msj_id: msjId }: { msj_id?: string } = req.body;

  if (phone === undefined || msjId === undefined) {
    const error = new HttpError('Missing parameters phone or convict id', 403)
    return next(error)
  }

  const phoneWithAreaCode = phone.startsWith('+33')
    ? phone
    : phone.replace(/\D|^0+/g, '+33')

  let user: User | null

  // Check user existence
  try {
    user = await User.findOne({
      where: { msjId }
    })
  } catch (err) {
    const error = new HttpError(
      "Une erreur s'est produite lors de votre demande de modification de numéro de téléphone, contactez l'administrateur du site",
      500
    )
    return next(error)
  }

  if (user == null) {
    const error = new HttpError(
      'Le msj_id ne correspond à aucun utilisateur',
      404
    )
    return next(error)
  }

  try {
    user.set({
      phone
    })
    user = await user.save()
  } catch (err) {
    const error = new HttpError(
      "Une erreur s'est produite lors de votre demande de modification de numéro de téléphone, contactez l'administrateur du site",
      500
    )
    return next(error)
  }

  const messageText = `Votre numéro de téléphone a été modifié. Pour accéder de nouveau à votre espace personnel, votre identifiant est ${phone}. Le mot de passe n'a pas été modifié. En cas de difficulté, contacter votre CPIP référent ou support@mon-suivi-justice.beta.gouv.fr.
  Lien vers votre espace personnel : ${getEnv('FRONT_DOMAIN')}`

  const updatePhoneSMSData = {
    destinationAddress: phoneWithAreaCode,
    messageText,
    originatorTON: '1',
    originatingAddress: getEnv('SMS_SENDER'),
    maxConcatenatedMessages: 10
  }

  const sms = new SMSService(updatePhoneSMSData)
  sms.send()
  res.status(200).json({ message: 'Phone number updated' })
}

export { login, signup, invite, resetPassword, getCpip, updateUserPhoneNumber }
