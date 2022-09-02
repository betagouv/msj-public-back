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

exports.login = login
exports.signup = signup
