const { v4: uuidv4 } = require('uuid')

const HttpError = require('../models/http-error')

const DUMMY_USERS = [
  {
    uid: 'u1',
    name: 'Jean Dupont',
    email: 'jean.dupont@test.com',
    password: 'test'
  },
  {
    uid: 'u2',
    name: 'Bob Dupneu',
    email: 'bob.dupneu@test.com',
    password: 'test'
  }
]

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS })
}

const signup = (req, res, next) => {
  const { name, email, password } = req.body
  const createdUser = {
    uid: uuidv4(),
    name,
    email,
    password
  }
  DUMMY_USERS.push(createdUser)
  res.status(201).json({ users: DUMMY_USERS })
}

const login = (req, res, next) => {
  const { email, password } = req.body

  const user = DUMMY_USERS.filter((u) => u.email === email)

  if (!user || user.password !== password) {
    throw new HttpError('Wrong credentials', 401)
  }

  res.json({ message: 'Logged in' })
}

exports.getUsers = getUsers
exports.login = login
exports.signup = signup
