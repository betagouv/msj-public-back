
const jwt = require('jsonwebtoken')
const HttpError = require('../utils/http-error')

const checkAuth = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next()
  }
  try {
    const token = req.headers.authorization.split(' ')[1]

    if (!token) {
      throw new Error("Cette opération n'est pas authorisée")
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    req.userData = { userId: decodedToken.userId }
    next()
  } catch (error) {
    const err = new HttpError("Cette opération n'est pas autorisée", 401)
    return next(err)
  }
}

module.exports = checkAuth
