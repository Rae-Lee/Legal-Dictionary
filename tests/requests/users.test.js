process.env.NODE_ENV = 'test'
const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const sinon = require('sinon')
const app = require('../../app')
const passport = require('../../config/passport')
const helpers = require('../../helpers/auth-helpers')
const db = require('../../models')
const { sequelize, User } = db

describe('# JWT 還在有效期，但實際權限已被移除', () => {
  before(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await User.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    this.authenticate = sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
      callback(null, { name: 'root' })
      return (req, res, next) => { }
    })
    this.getUser = sinon.stub(
      helpers, 'getUser'
    ).returns({ id: 1, role: 'user', deletedAt: null })
    await User.create({ account: 'User1', name: 'User1', email: 'User1', password: 'User1', deletedAt: 'Fri Mar 24 2023', role: 'user' })
  })
  it('1.JWT 還在有效期，但實際權限已被移除', (done) => {
    request(app)
      .get('/api/v1/users/1')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body.status).to.equal(403)
        expect(res.body.message).deep.to.equal('您的帳號已被列入黑名單中，請聯絡客服人員提供協助！')
      })
    done()
  })
  afterEach(async () => {
    this.authenticate.restore()
    this.getUser.restore()
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await User.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})
describe('# get personal profile', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await User.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    this.authenticate = sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
      callback(null, { name: 'root' })
      return (req, res, next) => {}
    })
    this.getUser = sinon.stub(
      helpers, 'getUser'
    ).returns({ id: 1, role: 'user', deletedAt: null })
    await User.create({ account: 'User1', name: 'User1', email: 'User1', password: 'User1', deletedAt: null, role: 'user' })
  })
  context('#successfully', () => {
    it('2.成功回傳api', (done) => {
      request(app)
        .get('/api/v1/users/1')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data).to.not.have.property('password')
          expect(res.body.data.account).to.equal('User1')
        })
      done()
    })
  })
  context('#fail', () => {
    it('3.瀏覽他人的資訊', (done) => {
      request(app)
        .get('/api/v1/users/2')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(403)
          expect(res.body.message).deep.to.equal('沒有瀏覽的權限！')
        })
      done()
    })
  })
  afterEach(async () => {
    this.authenticate.restore()
    this.getUser.restore()
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await User.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})
describe('# get personal profile', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await User.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    this.authenticate = sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
      callback(null, { name: 'root' })
      return (req, res, next) => { }
    })
    this.getUser = sinon.stub(
      helpers, 'getUser'
    ).returns({ id: 1, role: 'user', deletedAt: null })
    await User.create({ account: 'User1', name: 'User1', email: 'User1', password: 'User1', deletedAt: null, role: 'user' })
  })
  context('#successfully', () => {
    it('2.成功回傳api', (done) => {
      request(app)
        .get('/api/v1/users/1')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data).to.not.have.property('password')
          expect(res.body.data.account).to.equal('User1')
        })
      done()
    })
  })
  context('#fail', () => {
    it('3.瀏覽他人的資訊', (done) => {
      request(app)
        .get('/api/v1/users/2')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(403)
          expect(res.body.message).deep.to.equal('沒有瀏覽的權限！')
        })
      done()
    })
  })
  afterEach(async () => {
    this.authenticate.restore()
    this.getUser.restore()
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await User.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})
