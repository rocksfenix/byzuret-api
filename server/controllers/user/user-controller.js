const sanitize = require('mongo-sanitize')
const models = require('../../models')

exports.get = async (req, res, next) => {
  try {
    const user = await models.User.findById(
      sanitize(req.params.id)
    )

    if (!user) {
      return res.json({
        error: true,
        errorMessage: 'Not found 404'
      })
    }

    if (req.decode.sub !== req.params.id) {
      return res.json({
        error: null,
        user: user.toJSONPublic()
      })
    }

    res.json({
      error: null,
      user: user.toJSON()
    })
  } catch (error) {
    next(error)
    console.log(error)
  }
}

exports.put = async (req, res, next) => {
  try {
    if (!req.body.user) {
      return res.json({
        error: true,
        errorMessage: 'Invalid user object'
      })
    }

    let _id = req.decode.sub
    // Only admin can set other users
    if (req.body.user._id && req.decode.role === 'admin') {
      _id = sanitize(req.body.user._id)
    }

    const user = await models.User.findById(_id)

    if (!user) {
      return res.json({
        error: true,
        errorMessage: 'Not found 404'
      })
    }

    // Fields valid to set
    let seteables = [
      'fullname',
      'email',
      'bio',
      'password'
    ]

    // Fields valid to set only admin users
    if (req.decode.role === 'admin') {
      seteables = [
        'role',
        'status',
        ...seteables
      ]
    }

    seteables.forEach(key => {
      if (typeof req.body.user[key] !== 'undefined') {
        user[key] = req.body.user[key]
      }
    })

    await user.save()

    res.json({
      error: null,
      user: user.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

exports.delete = async (req, res, next) => {
  try {
    if (!req.decode.sub) {
      return res.json({
        error: true,
        errorMessage: 'No tienes permiso de realizar esta operacion'
      })
    }

    if (req.decode.role !== 'admin' && (req.decode.sub !== req.params.id)) {
      return res.json({
        error: true,
        errorMessage: 'No tienes permiso de realizar esta operacion'
      })
    }

    let _id = req.decode.sub
    // Only admin can set other users
    if (req.body.user._id && req.decode.role === 'admin') {
      _id = sanitize(req.body.user._id)
    }

    const user = await models.User.findById(_id)

    if (!user) {
      return res.json({
        error: true,
        errorMessage: 'Not found 404'
      })
    }

    user.remove((error) => {
      if (error) {
        return next(error)
      }

      res.json({
        error: null,
        message: 'Cuenta eliminada y olvidada exitosamente'
      })
    })
  } catch (error) {
    next(error)
  }
}
