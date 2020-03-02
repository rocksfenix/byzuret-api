const jwt = require('jsonwebtoken')
const models = require('../models')

const JWT_SECRET = process.env.JWT_SECRET
const JWT_SECRET_PASS = process.env.JWT_SECRET_PASS
// const IS_DEV = process.env.NODE_ENV !== 'production'

const getToken = ({ _id, role }) => {
  const payload = {
    sub: _id,
    role
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '5m' })
}

const getRefreshToken = ({ _id }) => {
  const payload = { sub: _id }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

const getResetPasswordToken = (sub) => {
  return jwt.sign({
    sub
  }, JWT_SECRET_PASS, { expiresIn: '20m' })
}

const verifyResetPasswordToken = (token) => {
  try {
    const decode = jwt.verify(token, JWT_SECRET_PASS)
    return decode
  } catch (error) {
    if (error.message === 'jwt expired') {
      return 'jwt expired'
    }
    return 'invalid jwt'
  }
}

const getTokens = (user) => ({
  token: getToken(user),
  refreshToken: getRefreshToken(user)
})

const authMiddleware = async (req, res, next) => {
  const token = req.headers.token
  const refreshToken = req.headers['refresh-token']

  req.decode = {}
  req.isLoggedIn = false

  res.set('Cache-Control', 'no-store')

  if (!token || !refreshToken) return next()

  try {
    const user = jwt.verify(token, JWT_SECRET)
    req.decode = user
    req.isLoggedIn = true
  } catch (error) {
    // JWT Expired

    if (error.message === 'jwt expired') {
      console.log('TOKEN EXPIRED')
      // Get user's token
      const e = await jwt.decode(token)
      const user = await models.User.findById(e.sub)
      if (!user) {
        req.decode = {}
        req.isLoggedIn = false
        return next()
      }

      // Validates the refreshToken
      // If is ivalid, We going to create and send the new token
      try {
        jwt.verify(refreshToken, JWT_SECRET)
        // Valid refresh token
        // It's created new token with last DB data
        const newToken = getToken(user)

        req.decode = await jwt.decode(newToken)

        res.set('Access-Control-Expose-Headers', 'X-App-Token')
        res.set('X-App-Token', newToken)
        return next()
      } catch (error) {
        // Expired session, logout on client side
        if (error.message === 'jwt expired' || error.message === 'invalid token') {
          res.set('Access-Control-Expose-Headers', 'x-app-session-expired')
          res.set('x-app-session-expired', 'true')
        }
      }
    }
  }
  next()
}

module.exports = {
  getTokens,
  authMiddleware
}
