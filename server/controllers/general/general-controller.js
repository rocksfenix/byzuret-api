const axios = require('axios')

const { NETLIFY_BUILD_HOOK } = process.env

if (!NETLIFY_BUILD_HOOK) {
  console.log('It\'s necesary define the netlify build hook')
  process.exit(1)
}

exports.rebuildApp = async (req, res, next) => {
  try {
    if (!req.decode.sub || (req.decode.sub && req.decode.role !== 'admin')) {
      return res.json({
        error: true,
        errorMessage: 'No tienes permiso de realizar esta operacion'
      })
    }

    await axios.post(NETLIFY_BUILD_HOOK)

    res.json({ message: 'Ok' })
  } catch (error) {
    next(error)
  }
}
