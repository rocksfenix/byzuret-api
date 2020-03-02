const mongoose = require('mongoose')

let MONGO_URI = process.env.MONGO_URI

if (process.env.NODE_ENV === 'test') {
  MONGO_URI = process.env.MONGO_URI_TEST
}

mongoose
  .connect(MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .catch((error) => {
    console.log('ERROR MONGO-DB::', error)
    throw error
  })

mongoose.set('useCreateIndex', true)
