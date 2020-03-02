const sanitize = require('mongo-sanitize')
const models = require('../../models')
const cloudinary = require('../../connections/cloudinary')

exports.getAll = async (req, res, next) => {
  try {
    let limit = 15
    let skip = 0
    let query = {}

    const text = req.query.text ? new RegExp(
      sanitize(req.query.text), 'i'
    ) : null

    if (text) {
      query = {
        $or: [
          { description: { $regex: text, $options: 'i' } }
        ]
      }
    }

    if (typeof req.query.skip !== 'undefined') {
      skip = Number(req.query.skip)
    }

    if (typeof req.query.limit !== 'undefined') {
      limit = Number(req.query.limit)
    }

    const total = await models.Image
      .find(query)
      .countDocuments()

    const images = await models.Image
      .find(query)
      .limit(limit)
      .skip(skip)
      .populate('author')
      .sort({ createdAt: -1 })
      .exec()

    res.json({
      error: null,
      images,
      total,
      hasMore: skip + images.length < total
    })
  } catch (error) {
    next(error)
  }
}

exports.addImage = async (req, res, next) => {
  try {
    if (!req.decode.sub || (req.decode.sub && req.decode.role !== 'admin')) {
      return res.json({
        error: true,
        errorMessage: 'No tienes permiso de realizar esta operacion'
      })
    }

    // Buscar el design por id
    const { id } = req.params
    const design = await models.Design.findById(id)
      .populate('images')

    if (!design) {
      return res.json({
        error: '404'
      })
    }

    // Upload image to cloudinary
    const result = await cloudinary.removeImage(req)

    if (!result) {
      return res.json({
        error: 'Error al subir imagen'
      })
    }

    // Creamos un modelo image
    const image = await models.Image.create({
      ...result,
      author: req.decode.sub
    })

    // Agregamos imagen a modelo
    design.images = [
      ...design.images,
      image
    ]

    await design.save()

    // populate the design

    res.json({
      design,
      image
    })
  } catch (error) {
    next(error)
  }
}

exports.remove = async (req, res, next) => {
  try {
    if (!req.decode.sub || (req.decode.sub && req.decode.role !== 'admin')) {
      return res.json({
        error: true,
        errorMessage: 'No tienes permiso de realizar esta operacion'
      })
    }

    const { id } = req.params

    const image = await models.Image.findById(id)

    if (!image) {
      return res.json({
        error: true,
        errorMessage: `404 No existe imagen con ese ID: ${id}`
      })
    }

    // Remove from cloudinary
    const result = await cloudinary.removeImage(image.public_id)

    image.remove(async (error) => {
      if (error) {
        return res.json({
          error: true,
          errorMessage: `Error al eliminar imagen con ID: ${id}`
        })
      }

      res.json({
        error: null,
        image,
        result
      })
    })
  } catch (error) {
    next(error)
  }
}
