'use strict'
const express = require('express')
const auth = require('./auth/auth')
const user = require('./user/user-controller')
const design = require('./design/design-controller')
const image = require('./image/image-controller')
const general = require('./general/general-controller')

// Get an instance of the router for api routes
const api = express.Router()

api.get('/', (req, res) => {
  res.json({
    api: 'buZuret API V1',
    version: 1
  })
})

// Authentification
api
  .post('/auth', auth.authenticate)
  .post('/signup', auth.signup)

// Users
api.route('/user/:id')
  .get(user.get)
  .put(user.put)
  .delete(user.delete)

// Designs
api.route('/designs')
  .get(design.getAll)
  .post(design.post)

// Design
api.route('/design/:id')
  .get(design.get)
  .put(design.update)
  .delete(design.remove)

api.route('/design/:id/image')
  .post(image.addImage)

// Image
api.get('/images', image.getAll)
api.delete('/image/:id', image.remove)

// General
api.post('/rebuild', general.rebuildApp)

module.exports = api
