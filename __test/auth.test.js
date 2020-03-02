/* global describe, it, beforeEach */

// During the test the env variable is set to test
process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../server')
const models = require('../server/models')

chai.use(chaiHttp)

const expect = require('chai').expect

describe('/signup', () => {
  // Before each test we empty the database
  beforeEach((done) => {
    models.User.remove({}, (err) => {
      if (err) throw err
      done()
    })
  })

  it('User Signup', (done) => {
    const user = {
      email: 'testing@mailing.com',
      fullname: 'Joe Doe',
      password: '123456'
    }
    chai.request(app)
      .post('/signup')
      .send({ user })
      .end((e, res) => {
        expect(res.body.token).to.be.a('string')
        expect(res.body.refreshToken).to.be.a('string')
        expect(res.body.error).to.be.null // eslint-disable-line
        expect(res.status).be.equal(200)
        done()
      })
  })

  it('User Login', (done) => {
    const user = {
      email: 'testing@mailing.com',
      fullname: 'Joe Doe',
      password: '123456'
    }
    chai.request(app)
      .post('/signup')
      .send({ user })
      .end((e, res) => {
        expect(res.body.token).to.be.a('string')
        expect(res.body.refreshToken).to.be.a('string')
        expect(res.body.error).to.be.null // eslint-disable-line
        expect(res.status).be.equal(200)
        // Login
        chai.request(app)
          .post('/auth')
          .send({ credentials: user })
          .end((e, res) => {
            expect(res.body.token).to.be.a('string')
            expect(res.body.refreshToken).to.be.a('string')
            expect(res.body.error).to.be.null // eslint-disable-line
            expect(res.status).be.equal(200)
            done()
          })
      })
  })
})
