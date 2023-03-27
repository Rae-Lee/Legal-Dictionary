process.env.NODE_ENV = 'test'
const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const sinon = require('sinon')
const app = require('../../app')
const passport = require('../../config/passport')
const helpers = require('../../helpers/auth-helpers')
const db = require('../../models')
const { sequelize, User, Note, Favorite } = db

describe('# JWT 還在有效期，但實際權限已被移除', () => {
  before(async () => {
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
  after(async () => {
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
describe('# edit personal profile', () => {
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
    await User.create({ account: 'User1', name: 'User1', email: 'User1@example.com', password: '12345', deletedAt: null, role: 'user' })
  })
  context('#successfully', () => {
    it('4.更改帳號', (done) => {
      request(app)
        .put('/api/v1/users/1')
        .send('account=User2&name=User1&email=User1@example.com&password=12345&checkPassword=12345')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data).to.not.have.property('password')
          expect(res.body.data.account).to.equal('User2')
        })
      done()
    })
    it('5.更改密碼', (done) => {
      request(app)
        .put('/api/v1/users/1')
        .send('account=User1&name=User1&email=User1@example.com&password=1234&checkPassword=1234')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data).to.not.have.property('password')
          expect(res.body.data.account).to.equal('User1')
        })
      done()
    })
    it('6.成功更改資料庫資料', (done) => {
      request(app)
        .put('/api/v1/users/1')
        .send('account=User2&name=User1&email=User1@example.com&password=12345&checkPassword=12345')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          User.findByPk(1)
          .then(user => {
            expect(user.account).to.equal('User2')
            expect(user.email).to.equal('User1@example.com')
          })
        })
      done()
    })
  })
  context('#fail', () => {
    it('7.編輯他人的資訊', (done) => {
      request(app)
        .put('/api/v1/users/2')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(403)
          expect(res.body.message).deep.to.equal('沒有編輯的權限！')
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
describe('# get personal notes', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await User.destroy({ where: {}, truncate: true, force: true })
    await Note.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    this.authenticate = sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
      callback(null, { name: 'root' })
      return (req, res, next) => {}
    })
    this.getUser = sinon.stub(
      helpers, 'getUser'
    ).returns({ id: 1, role: 'user', deletedAt: null })
    await User.create({ account: 'User1', name: 'User1', email: 'User1@example.com', password: '12345', deletedAt: null, role: 'user' })
    await Note.create({ userId: 1, elementId: 1, content: '《毒品危害防制條例》主要內容包括：禁止製造、販賣、運輸、進口、出口、持有、使用毒品，規定毒品的分類和管制及規定毒品檢測、管制、教育、治療等措施。' })
  })
  context('#successfully', () => {
    it('8.回傳api', (done) => {
      request(app)
        .get('/api/v1/users/1/notes')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data.notes[0].elementId).to.equal(1)
          expect(res.body.data.notes[0]).to.have.property('relativeTime')
        })
      done()
    })
  })
  context('#fail', () => {
    it('9.瀏覽他人的筆記', (done) => {
      request(app)
        .get('/api/v1/users/2/notes')
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
    await Note.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})
describe('# get personal favorites', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await User.destroy({ where: {}, truncate: true, force: true })
    await Favorite.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    this.authenticate = sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
      callback(null, { name: 'root' })
      return (req, res, next) => {}
    })
    this.getUser = sinon.stub(
      helpers, 'getUser'
    ).returns({ id: 1, role: 'user', deletedAt: null })
    await User.create({ account: 'User1', name: 'User1', email: 'User1@example.com', password: '12345', deletedAt: null, role: 'user' })
    await Favorite.create({ userId: 1, elementId: 1 })
  })
  context('#successfully', () => {
    it('10.回傳api', (done) => {
      request(app)
        .get('/api/v1/users/1/likes')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data.favorites[0].elementId).to.equal(1)
        })
      done()
    })
  })
  context('#fail', () => {
    it('11.瀏覽他人的筆記', (done) => {
      request(app)
        .get('/api/v1/users/2/likes')
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
    await Favorite.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})
