
async function basicAuth (req, res, next) {
  // make authenticate path public
  if (req.path === '/users/authenticate') {
    return next()
  }

  // check for basic auth header
  if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
    return res.status(401).json({ message: 'Missing Authorization Header' })
  }

  // verify auth credentials
  const base64Credentials = req.headers.authorization.split(' ')[1]
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
  const [username, password] = credentials.split(':')

  console.log(username, password)
  console.log(process.env.HTTP_BASIC_AUTH_USER, process.env.HTTP_BASIC_AUTH_PSWD)

  if (username !== process.env.HTTP_BASIC_AUTH_USER || password !== process.env.HTTP_BASIC_AUTH_PSWD) {
    return res.status(401).json({ message: 'Invalid Authentication Credentials' })
  }

  next()
}

module.exports = basicAuth
