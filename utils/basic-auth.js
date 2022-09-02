
async function basicAuth (req, res, next) {
  // Check if headers are present
  if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
    return res.status(401).json({ message: 'Missing Authorization Header' })
  }

  // Check credentials
  const base64Credentials = req.headers.authorization.split(' ')[1]
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
  const [username, password] = credentials.split(':')

  if (username !== process.env.HTTP_BASIC_AUTH_USER || password !== process.env.HTTP_BASIC_AUTH_PSWD) {
    return res.status(401).json({ message: 'Invalid Authentication Credentials' })
  }

  next()
}

module.exports = basicAuth
