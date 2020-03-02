/* global describe, it */

// During the test the env variable is set to test
process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../server')

chai.use(chaiHttp)

const expect = require('chai').expect

describe('/', () => {
  it('Get API version in root', (done) => {
    chai.request(app)
      .get('/')
      .end((e, res) => {
        expect(res.body.api).be.equal('buZuret API V1')
        expect(res.body.version).be.equal(1)
        expect(res.status).be.equal(200)
        done()
      })
  })
})
