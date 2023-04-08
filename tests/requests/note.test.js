process.env.NODE_ENV = 'travis'
const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const sinon = require('sinon')
const app = require('../../app')
const passport = require('../../config/passport')
const helpers = require('../../helpers/auth-helpers')
const db = require('../../models')
const { sequelize, Element, Note } = db

describe('# add keyword note', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Element.destroy({ where: {}, truncate: true, force: true })
    await Note.destroy({ where: {}, truncate: true, force: true })
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
        .post('/api/v1/keywords/1/notes')
        .send('content=《毒品危害防制條例》主要內容包括：禁止製造、販賣、運輸、進口、出口、持有、使用毒品，規定毒品的分類和管制及規定毒品檢測、管制、教育、治療等措施。')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data.elementId).to.equal(1)
          expect(res.body.data.userId).to.equal(1)
        })
      done()
    })
    it('2.成功新增置資料庫', (done) => {
      request(app)
        .post('/api/v1/keywords/1/notes')
        .send('content=《毒品危害防制條例》主要內容包括：禁止製造、販賣、運輸、進口、出口、持有、使用毒品，規定毒品的分類和管制及規定毒品檢測、管制、教育、治療等措施。')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          Note.findByPk(1)
            .then(note => {
              expect(note.elementId).to.equal(1)
              expect(note.userId).to.equal(1)
              expect(note.content).to.equal('《毒品危害防制條例》主要內容包括：禁止製造、販賣、運輸、進口、出口、持有、使用毒品，規定毒品的分類和管制及規定毒品檢測、管制、教育、治療等措施。')
            })
        })
      done()
    })
  })
  context('#fail', () => {
    it('3.內容空白', (done) => {
      request(app)
        .post('/api/v1/keywords/1/notes')
        .send('content=')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(400)
          expect(res.body.message).deep.to.equal(['筆記內容不可空白！'])
        })
      done()
    })
  })
  afterEach(async () => {
    this.authenticate.restore()
    this.getUser.restore()
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Element.destroy({ where: {}, truncate: true, force: true })
    await Note.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})
describe('# delete keyword note', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Element.destroy({ where: {}, truncate: true, force: true })
    await Note.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    this.authenticate = sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
      callback(null, { name: 'root' })
      return (req, res, next) => { }
    })
    this.getUser = sinon.stub(
      helpers, 'getUser'
    ).returns({ id: 1, role: 'user', deletedAt: null })
    await Element.create({ name: '毒品' })
    await Note.create({ userId: 1, elementId: 1, content: '1235'})
    await Note.create({ userId: 2, elementId: 1, content: '1235' })
  })
  context('#successfully', () => {
    it('4.成功回傳api', (done) => {
      request(app)
        .delete('/api/v1/notes/1')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data.id).to.equal(1)
        })
      done()
    })
    it('5.成功刪除資料庫資料', (done) => {
      request(app)
        .delete('/api/v1/notes/1')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          Note.findByPk(1)
            .then(note => {
              expect(note).to.be.null
            })
        })
      done()
    })
  })
  context('#fail', () => {
    it('6.刪除別人的筆記', (done) => {
      request(app)
        .delete('/api/v1/notes/2')
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
    await Element.destroy({ where: {}, truncate: true, force: true })
    await Note.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})
describe('# edit keyword note', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Element.destroy({ where: {}, truncate: true, force: true })
    await Note.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    this.authenticate = sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
      callback(null, { name: 'root' })
      return (req, res, next) => { }
    })
    this.getUser = sinon.stub(
      helpers, 'getUser'
    ).returns({ id: 1, role: 'user', deletedAt: null })
    await Element.create({ name: '毒品' })
    await Note.create({ userId: 1, elementId: 1, content: '1235' })
  })
  context('#successfully', () => {
    it('7.成功回傳api', (done) => {
      request(app)
        .put('/api/v1/notes/1')
        .send('content=《毒品危害防制條例》')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data.elementId).to.equal(1)
          expect(res.body.data.userId).to.equal(1)
          expect(res.body.data.content).to.equal('《毒品危害防制條例》')
        })
      done()
    })
    it('8.成功新增至資料庫', (done) => {
      request(app)
        .put('/api/v1/notes/1')
        .send('content=《毒品危害防制條例》')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          Note.findByPk(1)
            .then(note => {
              expect(note.elementId).to.equal(1)
              expect(note.userId).to.equal(1)
              expect(note.content).to.equal('《毒品危害防制條例》')
            })
        })
      done()
    })
  })
  context('#fail', () => {
    it('9.內容空白', (done) => {
      request(app)
        .put('/api/v1/notes/1')
        .send('content=')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(400)
          expect(res.body.message).deep.to.equal(['筆記內容不可空白！'])
        })
      done()
    })
  })
  afterEach(async () => {
    this.authenticate.restore()
    this.getUser.restore()
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Element.destroy({ where: {}, truncate: true, force: true })
    await Note.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})