'use strict'

const { Schema, model } = require('mongoose')
const { isEmail } = require('validator')
const uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require('bcryptjs')
const shortid = require('shortid')

const avatarDefault = '/static/img/avatar.png'

const UserSchema = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  username: { type: String, unique: true, required: true },
  provider: String,
  bio: String,
  status: { type: String, enum: ['active', 'hold'], default: 'active' },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    trim: true,
    required: [true, 'No puede estar es blanco'],
    validate: [isEmail, 'El email ingresado es invalido'],
    maxlength: [100, 'El email debe de tener maximo 100 caracteres'],
    index: true
  },
  fullname: { type: String, required: true },
  firstName: String,
  middleName: String,
  lastName: String,
  created: { type: Date, default: Date.now },
  avatar: String,
  password: { type: String, required: true }
}, { timestamps: true })

UserSchema.plugin(uniqueValidator, { message: 'Ya esta esta en uso' })

UserSchema.pre('save', function (next) {
  const user = this

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next()

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err)
      user.password = hash
      next()
    })
  })
})

UserSchema.methods.checkPassword = function (password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, function (err, res) {
      if (err) return reject(err)
      resolve(res)
    })
  })
}

UserSchema.methods.toJSON = function () {
  return {
    fullname: this.fullname,
    firstName: this.firstName,
    lastName: this.lastName,
    role: this.role,
    email: this.email,
    _id: this._id,
    avatar: this.avatar || avatarDefault,
    bio: this.bio
  }
}

UserSchema.methods.toJSONPublic = function () {
  return {
    firstName: this.firstName,
    avatar: this.avatar || avatarDefault,
    bio: this.bio
  }
}

module.exports = model('User', UserSchema)
