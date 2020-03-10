const { Schema, model } = require('mongoose')
const shortid = require('shortid')

const DesignSchema = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  author: { type: String, ref: 'User', required: [true, 'El Author es requerido'] },
  title: { type: String, default: 'Skinny Jeans' },
  type: { type: String, default: 'Jeans' },
  sizes: { type: String, default: '5-7-9-11-13-15' },
  colors: { type: Array, default: ['#157bc6'] },
  price: { type: Number, default: 275 },
  lotePrice: { type: Number, default: 195 },
  off: { type: Number, default: 0 },
  composition: { type: String, default: '79% algodón | 19% poliéster | 2% elastano' },
  description: { type: String, default: 'Super elástico que dura de día a noche; ajuste cómodo que no pierde forma.' },
  images: [{ type: String, ref: 'Image' }]
}, { timestamps: true })

module.exports = model('Design', DesignSchema)
