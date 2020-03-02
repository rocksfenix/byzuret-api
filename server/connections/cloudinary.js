const cloudinary = require('cloudinary')
// const potrace = require('potrace')
const fs = require('fs')
const path = require('path')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

exports.uploadImage = (req) => new Promise((resolve, reject) => {
  cloudinary.v2.uploader.upload(req.files.image.tempFilePath, {
    folder: 'designs'
  }, (error, result) => {
    if (error) {
      return reject(error)
    }

    resolve(result)
  })
})

exports.removeImage = (publicId) => new Promise((resolve, reject) => {
  cloudinary.v2.api.delete_resources([publicId], (error, result) => {
    if (error) return reject(error)

    resolve(result)
  })
})

exports.uploadImageSvg = (req) => new Promise((resolve, reject) => {

  // potrace.trace(req.files.image.tempFilePath, { steps: 2 }, function (err, svg) {
  //   if (err) throw err

  //   fs.writeFileSync(path.resolve(__dirname, '../', '__temp', 'file.svg'), svg)
  //   // fs.writeFileSync('./output.svg', svg)
  // })
})
