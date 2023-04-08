process.env.NODE_ENV = 'travis'
const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const app = require('../../app')
const db = require('../../models')
const { sequelize, Reference, Element, Field, Search } = db

describe('# get reference', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Reference.destroy({ where: {}, truncate: true, force: true })
    await Field.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    await Field.create({ name: '刑事判決' })
    await Reference.create({ name: '最高法院 97 年度 台上 字第 892 號刑事判決', content: 'Non ipsam inventore laborum voluptas id recusandae.', quote: 'Non ipsam inventore laborum voluptas id recusandae.', fieldId: 1 })
  })
  context('#successfully', () => {
    it('1.成功回傳api', (done) => {
      request(app)
        .get('/api/v1/references/1')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data.name).to.equal('最高法院 97 年度 台上 字第 892 號刑事判決')
          expect(res.body.data.Field.name).to.equal('刑事判決')
        })
      done()
    })
  })
  context('#fail', () => {
    it('2.找不到裁判', (done) => {
      request(app)
        .get('/api/v1/references/2')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(404)
          expect(res.body.message).deep.to.equal('本段落尚未有完整裁判書內容!')
        })
      done()
    })
  })
  afterEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Reference.destroy({ where: {}, truncate: true, force: true })
    await Field.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})
describe('# get keyword', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Element.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    await Element.create({ name: '毒品' })
  })
  context('#successfully', () => {
    it('3.成功回傳api', (done) => {
      request(app)
        .get('/api/v1/keywords/1')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data.name).to.equal('毒品')
        })

      done()
    })
  })
  context('#fail', () => {
    it('4.找不到關鍵字', (done) => {
      request(app)
        .get('/api/v1/keywords/2')
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
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Element.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})
describe('# get top10 keyword', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Element.destroy({ where: {}, truncate: true, force: true })
    await Search.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    await Element.create({ name: '毒品' })
    await Element.create({ name: '詐欺' })
    await Search.create({ elementId: 1 })
    await Search.create({ elementId: 1 })
    await Search.create({ elementId: 2 })
  })
  context('#successfully', () => {
    it('5.成功回傳api', (done) => {
      request(app)
        .get('/api/v1/keywords/top')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data.keywords.length).to.equal(2)
          expect(res.body.data.keywords[0].name).to.equal('毒品')
        })
      done()
    })
  })
  afterEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Element.destroy({ where: {}, truncate: true, force: true })
    await Search.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})
describe('# add keyword', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Element.destroy({ where: {}, truncate: true, force: true })
    await Search.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    await Element.create({ name: '毒品' })
  })
  context('#successfully', () => {
    it('6.成功回傳api', (done) => {
      request(app)
        .post('/api/v1/keywords')
        .send('name=詐欺')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data.id).to.equal(2)
        })
      done()
    })
    it('7.成功新增至資料庫', (done) => {
      request(app)
        .post('/api/v1/keywords')
        .send('name=詐欺')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          Search.findByPk(1)
            .then(search => {
              expect(search.elementId).to.equal(2)
            })
        })
      done()
    })
  })
  context('#fail', () => {
    it('8.搜尋欄空白', (done) => {
      request(app)
        .post('/api/v1/keywords')
        .send('name=')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(400)
          expect(res.body.message).deep.to.equal(['搜尋欄不可空白！'])
        })
      done()
    })
  })
  afterEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await Element.destroy({ where: {}, truncate: true, force: true })
    await Search.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})
