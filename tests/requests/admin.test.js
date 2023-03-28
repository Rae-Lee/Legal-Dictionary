process.env.NODE_ENV = 'test'
const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../../app')
const db = require('../../models')
const { sequelize, User, Note, Favorite } = db
const sinon = require('sinon')
const passport = require('../../config/passport')
const helpers = require('../../helpers/auth-helpers')
describe('# login', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await User.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    await User.create({
      account: 'User1',
      name: 'User1',
      role: 'admin',
      email: 'User1@example.com',
      password: await bcrypt.hash('12345', 10)
    })
  })
  context('#successfully', () => {
    it('1.成功回傳api', (done) => {
      request(app)
        .post('/api/v1/admin/login')
        .send('account=User1&password=12345')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data).to.have.property('token')
          expect(res.body.message).to.equal('登入成功!')
          expect(res.body.data.user).to.not.have.property('password')
          expect(res.body.data.user.account).to.equal('User1')
          done()
        })
    })
  })
  context('#fail', () => {
    it('2.當有欄位沒有填', (done) => {
      request(app)
        .post('/api/v1/admin/login')
        .send('account=&password=12345')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(400)
          expect(res.body.message).deep.to.equal(['所有欄位皆為必填！'])
          done()
        })
    })
    it('3.帳號尚未註冊', (done) => {
      request(app)
        .post('/api/v1/admin/login')
        .send('account=User2&password=12345')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(403)
          expect(res.body.message).to.equal('無法登入！')
          done()
        })
    })
    it('4.帳號或密碼錯誤', (done) => {
      request(app)
        .post('/api/v1/admin/login')
        .send('account=User1&password=1234')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(401)
          expect(res.body.message).to.equal('帳號或密碼錯誤！')
          done()
        })
    })
    it('5.使用一般使用者帳號登入後台', (done) => {
      User.create({ account: 'root', role: 'user', password: bcrypt.hash('12345', 10) })
        .then(() => {
          request(app)
            .post('/api/v1/admin/login')
            .send('account=root&password=12345')
            .set('Accept', 'application/json')
            .end((err, res) => {
              if (err) return done(err)
              expect(res.body.status).to.equal(403)
              expect(res.body.message).to.equal('無法登入！')
            })
        })
      done()
    })
    it('6.帳號已列入黑名單', (done) => {
      User.create({ account: 'User2', password: bcrypt.hash('12345', 10), role: 'admin', deletedAt: '2023-03-26 14:00' })
        .then(() => {
          request(app)
            .post('/api/v1/admin/login')
            .send('account=User2&password=12345')
            .set('Accept', 'application/json')
            .end((err, res) => {
              if (err) return done(err)
              expect(res.body.status).to.equal(403)
              expect(res.body.message).to.equal('您的帳號已被列入黑名單中，請聯絡客服人員提供協助')
            })
        })
      done()
    })
  })
  afterEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await User.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})
describe('# get all users', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await User.destroy({ where: {}, truncate: true, force: true })
    await Favorite.destroy({ where: {}, truncate: true, force: true })
    await Note.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    this.authenticate = sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
      callback(null, { name: 'root' })
      return (req, res, next) => { }
    })
    this.getUser = sinon.stub(
      helpers, 'getUser'
    ).returns({ id: 1, role: 'admin', deletedAt: null })
    await User.create({ account: 'User1', name: 'User1', email: 'User1', password: 'User1', deletedAt: null, role: 'admin' })
    await User.create({ account: 'User2', name: 'User2', email: 'User2', password: 'User2', deletedAt: null, role: 'user' })
    await Note.create({ userId: 2, elementId: 1, content: '1235' })
    await Favorite.create({ userId: 2, elementId: 1 })
  })
  context('#successfully', () => {
    it('7.成功回傳api', (done) => {
      request(app)
        .get('/api/v1/admin/users')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data[0]).to.not.have.property('password')
          expect(res.body.data[0].account).to.equal('User2')
          expect(res.body.data[0].noteCounts).to.equal(1)
          expect(res.body.data[0].favoriteCounts).to.equal(1)
        })
      done()
    })
  })
  context('#fail', () => {
    it('8.以一般使用者的身分瀏覽', (done) => {
      request(app)
        .get('/api/v1/admin/users')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(403)
          expect(res.body.message).deep.to.equal('沒有瀏覽及編輯的權限')
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
    await Note.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})
describe('# delete user', () => {
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
    ).returns({ id: 1, role: 'admin', deletedAt: null })
    await User.create({ account: 'User1', name: 'User1', email: 'User1', password: 'User1', deletedAt: null, role: 'admin' })
    await User.create({ account: 'User2', name: 'User2', email: 'User2', password: 'User2', deletedAt: null, role: 'user' })
  })
  context('#successfully', () => {
    it('9.成功回傳api', (done) => {
      request(app)
        .delete('/api/v1/admin/users/2')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.message).to.equal('已成功刪除此用戶！')
          expect(res.body.data.id).to.equal(2)
        })
      done()
    })
    it('10.成功刪除資料庫資料', (done) => {
      request(app)
        .delete('/api/v1/admin/users/2')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          User.findByPk(2)
            .then(user => {
              expect(user).to.be.null
            })
        })
      done()
    })
  })
  context('#fail', () => {
    it('11.刪除管理員帳號', (done) => {
      request(app)
        .delete('/api/v1/admin/users/1')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(403)
          expect(res.body.message).deep.to.equal('不得刪除管理員帳號！')
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
