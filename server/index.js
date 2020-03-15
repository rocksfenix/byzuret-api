'use strict'

// Config env var .env
require('dotenv').config()

// Connection MongoDB
require('./connections/db')

const express = require('express')
const path = require('path')
const cors = require('cors')
const ip = require('ip')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const methodOverride = require('method-override')
const fileUpload = require('express-fileupload')
const API = require('./controllers/api')
const { authMiddleware } = require('./middlewares/auth')

const PORT = parseInt(process.env.PORT) || 8080
const app = express()

// Don't expose any software information to potential hackers.
app.disable('x-powered-by')

app.use(cors({
  origin: ['http://localhost', 'https://byzuret.com']
}))
app.use(morgan('dev'))
app.use(methodOverride())
app.use(bodyParser.json({ limit: '5mb' }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(fileUpload({
  limits: { fileSize: 20 * 1024 * 1024 }, // 5 MB,
  useTempFiles: true
}))
app.use(authMiddleware)
app.use(API)

app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`
    ⚡
      DEV MODE: ${process.env.NODE_ENV}
      GO: http://${ip.address()}:${PORT}
      GO: http://localhost:${PORT}
    `)
  }
})

// export server for testing
module.exports = app
