'use strict'

const sha512 = require('js-sha512')
const md5 = require('md5')

function SaveSafe (passText, userText) {
  const key = process.env.KI // env.process
  return (sha512(userText + sha512(userText + md5(key + passText + userText))))
}

module.exports = SaveSafe
