'use strict'

const sanitize = require('mongo-sanitize')
const parseFullName = require('parse-full-name').parseFullName
const { getTokens } = require('../../middlewares/auth')
const models = require('../../models')

const getRandomUsername = (email) => {
  return email.split('@')[0] + '_' + Math.floor(Math.random() * 1000)
}

exports.authenticate = async (req, res, next) => {
  try {
    if (!req.body.credentials) {
      return res.json({
        error: true,
        errorMessage: 'Invalid credentials Object',
        path: 'email',
        status: 422
      })
    }

    const { email, password } = req.body.credentials

    if (!email) {
      return res.json({
        error: true,
        errorMessage: 'Email es requerido',
        path: 'email',
        status: 422
      })
    }

    if (!password) {
      return res.json({
        error: true,
        errorMessage: 'La contraseña es requerida',
        path: 'email',
        status: 422
      })
    }

    if (password.length < 6) {
      return res.json({
        error: true,
        errorMessage: 'La contraseña debe ser de minimo 6 caracteres',
        path: 'password',
        status: 422
      })
    }

    const user = await models.User.findOne({
      email: sanitize(email)
    })

    // User not found
    if (!user) {
      return res.json({
        error: true,
        errorMessage: 'No tenemos un registro con este email',
        path: 'email',
        status: 422
      })
    }

    const isValid = await user.checkPassword(password)

    // Invalid Pass
    if (!isValid) {
      return res.json({
        error: true,
        errorMessage: 'El email o la password son invalidas',
        path: 'email/password',
        status: 422
      })
    }

    const { token, refreshToken } = getTokens(user)

    res.json({
      user: user.toJSON(),
      error: null,
      token,
      refreshToken,
      errorMessage: ''
    })
  } catch (error) {
    next(error)
  }
}

exports.signup = async (req, res, next) => {
  try {
    if (!req.body.user) {
      return res.json({
        error: true,
        errorMessage: 'Invalid user object',
        status: 422,
        path: 'user'
      })
    }

    const { email, password, fullname } = req.body.user

    if (!fullname) {
      return res.json({
        error: true,
        errorMessage: 'El nombre es requerido',
        status: 422,
        path: 'fullname'
      })
    }

    if (!email) {
      return res.json({
        error: true,
        errorMessage: 'Email es requerido',
        path: 'email',
        status: 422
      })
    }

    if (!password) {
      return res.json({
        error: true,
        errorMessage: 'La contraseña es requerida',
        path: 'password',
        status: 422
      })
    }

    if (password.length < 6) {
      return res.json({
        error: true,
        errorMessage: 'La contraseña debe ser de minimo 6 caracteres',
        path: 'password',
        status: 422
      })
    }

    if (fullname.length < 3) {
      return res.json({
        error: true,
        errorMessage: 'El nombre debe tener minimo 3 caracteres',
        path: 'fullname',
        status: 422
      })
    }

    const userExist = await models.User.findOne({
      email: sanitize(email)
    })

    // if user exists
    if (userExist) {
      return res.json({
        error: true,
        errorMessage: 'Este email ya estaba registrado con nosotros, Quieres hacer login?',
        status: 422,
        path: 'email'
      })
    }

    const { first, middle, last } = parseFullName(fullname)

    const user = await models.User.create({
      username: getRandomUsername(email),
      fullname,
      email,
      password,
      provider: 'email',
      firstName: first,
      middleName: middle,
      lastName: last
    })

    const { token, refreshToken } = getTokens(user)

    res.json({
      error: null,
      user: user.toJSON(),
      token,
      refreshToken,
      errorMessage: ''
    })
  } catch (error) {
    next(error)
  }
}
