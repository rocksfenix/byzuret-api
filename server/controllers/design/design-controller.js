const sanitize = require('mongo-sanitize')
const models = require('../../models')
const cloudinary = require('../../connections/cloudinary')
const { uniqueNamesGenerator, adjectives, countries, names } = require('unique-names-generator')

const getShortName = () => uniqueNamesGenerator({
  dictionaries: [adjectives, names, countries],
  separator: ' ',
  length: 3
})

const removeImage = (image) => new Promise((resolve, reject) => {
  models.Image.findById(image._id, (error, doc) => {
    if (error) {
      return console.log(error)
    }
    doc.remove(error => {
      if (error) {
        return console.log(error)
      }
      resolve()
    })
  })
})

exports.getAll = async (req, res, next) => {
  try {
    let limit = 50
    let skip = 0
    let query = {}

    const text = req.query.text ? new RegExp(
      sanitize(req.query.text), 'i'
    ) : null

    if (text) {
      query = {
        $or: [
          { title: { $regex: text, $options: 'i' } },
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

    const defaultImages = [{
      _id: 'def',
      author: '',
      public_id: '',
      format: 'String',
      width: 100,
      height: 100,
      bytes: '',
      secure_url: '',
      design_id: ''
    }]

    res.json({
      error: null,
      designs: designs.map(design => ({
        _id: design._id,
        author: design.author,
        title: design.title,
        type: design.type,
        sizes: design.sizes,
        colors: design.colors,
        price: design.price,
        lotePrice: design.lotePrice,
        off: design.off,
        composition: design.composition,
        description: design.description,
        images: design.images.length
          ? design.images
          : defaultImages
      })),
      total,
      hasMore: skip + designs.length < total
    })
  } catch (error) {
    next(error)
  }
}

exports.post = async (req, res, next) => {
  try {
    // Avoid access to users that not to be admin
    if (!req.decode.sub || (req.decode.sub && req.decode.role !== 'admin')) {
      return res.json({
        error: true,
        errorMessage: 'No tienes permiso de realizar esta operacion'
      })
    }

    const title = req.body.design.title || `Jeans ${getShortName()}`

    // We created the design
    const design = await models.Design.create({
      title,
      author: req.decode.sub
    })

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
    // Avoid access to users that not to be admin
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

exports.remove = async (req, res, next) => {
  try {
    // Avoid access to users that not to be admin
    if (!req.decode.sub || (req.decode.sub && req.decode.role !== 'admin')) {
      return res.json({
        error: true,
        errorMessage: 'No tienes permiso de realizar esta operacion'
      })
    }

    // Search by id
    const { id } = req.params
    const design = await models.Design.findById(id).populate('author images')

    if (!design) {
      return res.json({
        error: true,
        errorMessage: `404 No exite design con ID: ${id}`
      })
    }

    design.images.forEach((image) => {
      // Remove images from cloudinary
      cloudinary.removeImage(image.public_id)
    })

    // Remove images from db
    await Promise.all(design.images.map(async img => {
      return removeImage(img)
    }))

    await design.remove()

    res.json({
      design,
      message: `Design with id: ${id} was removed successfully`
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
