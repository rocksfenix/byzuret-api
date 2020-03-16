const axios = require('axios')
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const { NETLIFY_BUILD_HOOK } = process.env

if (!NETLIFY_BUILD_HOOK) {
  console.log('It\'s necesary define the netlify build hook')
  process.exit(1)
}

exports.rebuildApp = async (req, res, next) => {
  try {
    if (!req.decode.sub || (req.decode.sub && req.decode.role !== 'admin')) {
      return res.json({
        error: true,
        errorMessage: 'No tienes permiso de realizar esta operacion'
      })
    }

    await axios.post(NETLIFY_BUILD_HOOK)

    res.json({ message: 'Ok' })
  } catch (error) {
    next(error)
  }
}

exports.contactForm = async (req, res, next) => {
  try {
    const { fullname, email, recaptchaToken, design } = req.body.data

    if (!fullname || !email) {
      return res.json({
        error: true,
        errorMessage: 'fullname and email are required'
      })
    }

    // Check captcha
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_KEY_SECRET}&response=${recaptchaToken}&remoteip=${req.connection.remoteAddress}`

    const { data } = await axios.post(verificationURL)

    if (!data.success) {
      return res.json({
        error: true,
        errorMessage: 'The recaptcha is invalid or expired',
        path: 'recaptcha',
        status: 422
      })
    }

    const msg = {
      to: 'byzuret@gmail.com',
      from: email,
      subject: `Solicitud de informacion ByZuret - ${Math.random().toString(16).substr(2)}`,
      html: `
        <p>Name: ${fullname}</p>
        <p>Email: ${email}</p>
        <h3>Informacion del Diseño solicitado</h3>
        <p>
          Nombre del diseño: ${design.title}
        </p>
        <p>
          ID: ${design._id}
        </p>
        <p>
          <img src='https://res.cloudinary.com/byzuret/image/upload/w_200/${design.images[0].public_id}' alt='Imagen de diseño' />
        </p>
          <a href='https://byzuret.com/design/${design._id}'>Link del diseño</a>
        <p>
        </p>
        <hr/>
        <h3>Posible Respuesta</h3>
        <p>
          Hola Buen día ${fullname},
        </p>
        <p>
          Recibimos tu solicitud sobre nuestros productos, somos una empresa dedicada a la fabricación de Jeans y derivados para mujer ¿Que es lo que te interesa saber?
        </p>
        <p>
          Saludos
        </p>
        <p>
          Adriana Gallegos
        </p>
      `
    }

    try {
      await sgMail.send(msg)
      res.json({
        success: true
      })
    } catch (error) {
      res.json({
        error: true,
        errorMessage: error.toString()
      })
    }
  } catch (error) {
    next(error)
  }
}
