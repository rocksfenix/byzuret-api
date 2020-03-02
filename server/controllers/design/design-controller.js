const sanitize = require('mongo-sanitize')
const models = require('../../models')

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

    const total = await models.Design
      .find(query)
      .countDocuments()

    const designs = await models.Design
      .find(query)
      .limit(limit)
      .skip(skip)
      .populate('author images')
      .sort({ createdAt: -1 })
      .exec()

    res.json({
      error: null,
      designs,
      total,
      hasMore: skip + designs.length < total
    })
  } catch (error) {
    next(error)
  }
}

exports.post = async (req, res, next) => {
  try {
    // Esta es la logica
    if (!req.decode.sub || (req.decode.sub && req.decode.role !== 'admin')) {
      return res.json({
        error: true,
        errorMessage: 'No tienes permiso de realizar esta operacion'
      })
    }

    // We created the design
    const design = await models.Design.create({
      title: req.body.design.title,
      author: req.decode.sub
    })

    console.log(design)

    res.json({
      design
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

exports.update = async (req, res, next) => {
  try {
    // Esta es la logica
    if (!req.decode.sub || (req.decode.sub && req.decode.role !== 'admin')) {
      return res.json({
        error: true,
        errorMessage: 'No tienes permiso de realizar esta operacion'
      })
    }

    // Buscar el design por id
    const { id } = req.params
    const design = await models.Design.findById(id).populate('author images')

    if (!design) {
      return res.json({
        error: true,
        errorMessage: `404 No exite design con ID: ${id}`
      })
    }

    // Unicos valores seteables
    const seteables = [
      'title',
      'type',
      'sizes',
      'price',
      'lotePrice',
      'off',
      'description',
      'images',
      'colors'
    ]

    seteables.forEach(key => {
      if (typeof req.body.design[key] !== 'undefined') {
        design[key] = req.body.design[key]
      }
    })

    await design.save()

    res.json({
      design
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

exports.get = async (req, res, next) => {
  try {
    // Buscar el design por id
    const { id } = req.params
    const design = await models.Design.findById(id)

    if (!design) {
      return res.json({
        error: true,
        errorMessage: `404 No exite design con ID: ${id}`
      })
    }

    res.json({
      design
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
