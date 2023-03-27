process.env.NODE_ENV = 'test'
const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const sinon = require('sinon')
const app = require('../../app')
const passport = require('../../config/passport')
const helpers = require('../../helpers/auth-helpers')
const db = require('../../models')
const { sequelize, Element, Favorite } = db

describe('# add keyword like', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Element.destroy({ where: {}, truncate: true, force: true })
    await Favorite.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    this.authenticate = sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
      callback(null, { name: 'root' })
      return (req, res, next) => { }
    })
    this.getUser = sinon.stub(
      helpers, 'getUser'
    ).returns({ id: 1, role: 'user', deletedAt: null })
    await Element.create({ name: '毒品' })
  })
  context('#successfully', () => {
    it('1.成功回傳api', (done) => {
      request(app)
        .post('/api/v1/keywords/1/likes')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data.name).to.equal('毒品')
        })
      done()
    })
    it('2.成功新增置資料庫', (done) => {
      request(app)
        .post('/api/v1/keywords/1/likes')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          Favorite.findByPk(1)
            .then(like => {
              expect(like.elementId).to.equal(1)
              expect(like.userId).to.equal(1)
            })
        })
      done()
    })
  })
  context('#fail', () => {
    it('3.找不到關鍵字', (done) => {
      request(app)
        .post('/api/v1/keywords/2/likes')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(404)
          expect(res.body.message).deep.to.equal('找不到相關的內容，請試試其他關鍵字!')
        })
      done()
    })
  })
  afterEach(async () => {
    this.authenticate.restore()
    this.getUser.restore()
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Element.destroy({ where: {}, truncate: true, force: true })
    await Favorite.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})
describe('# delete keyword like', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Element.destroy({ where: {}, truncate: true, force: true })
    await Favorite.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    this.authenticate = sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
      callback(null, { name: 'root' })
      return (req, res, next) => { }
    })
    this.getUser = sinon.stub(
      helpers, 'getUser'
    ).returns({ id: 1, role: 'user', deletedAt: null })
    await Element.create({ name: '毒品' })
    await Favorite.create({ userId: 1, elementId: 1 })
  })
  context('#successfully', () => {
    it('4.成功回傳api', (done) => {
      request(app)
        .delete('/api/v1/keywords/1/likes')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data.name).to.equal('毒品')
        })
      done()
    })
    it('5.成功刪除資料庫資料', (done) => {
      request(app)
        .delete('/api/v1/keywords/1/likes')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          Favorite.findByPk(1)
            .then(like => {
              expect(like).to.be.null
            })
        })
      done()
    })
  })
  context('#fail', () => {
    it('6.找不到關鍵字', (done) => {
      request(app)
        .delete('/api/v1/keywords/2/likes')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(404)
          expect(res.body.message).deep.to.equal('找不到相關的內容，請試試其他關鍵字!')
        })
      done()
    })
  })
  afterEach(async () => {
    this.authenticate.restore()
    this.getUser.restore()
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Element.destroy({ where: {}, truncate: true, force: true })
    await Favorite.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})
