const { Schema, model } = require('mongoose')
const shortid = require('shortid')

const ImageSchema = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  author: { type: String, ref: 'User', required: [true, 'El Author es requerido'] },
  public_id: String,
  format: String,
  width: Number,
  height: Number,
  bytes: Number,
  secure_url: String
}, { timestamps: true })

module.exports = model('Image', ImageSchema)
