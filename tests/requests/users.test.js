process.env.NODE_ENV = 'test'
const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const sinon = require('sinon')
const bcrypt = require('bcryptjs')
const app = require('../../app')
const db = require('../../models')
const { sequelize, User } = db

describe('# register', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await User.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
  context('#successfully', () => {
    it('1.成功回傳api', (done) => {
      request(app)
        .post('/api/v1/users/register')
        .send('account=User1&name=User1&email=User1@example.com&password=12345&checkPassword=12345')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.message).to.equal('帳號已成功註冊')
          expect(res.body.data.account).to.equal('User1')
          done()
        })
    })
    it('2.成功新增資料到資料庫', (done) => {
      request(app)
        .post('/api/v1/users/register')
        .send('account=User1&name=User1&email=User1@example.com&password=12345&checkPassword=12345')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          User.findByPk(1)
            .then(user => {
              expect(user.account).to.equal('User1')
              expect(user.name).to.equal('User1')
              expect(user.email).to.equal('User1@example.com')
            })
          done()
        })
    })
  })
  context('#fail', () => {
    it('3.當有欄位沒有填', (done) => {
      request(app)
        .post('/api/v1/users/register')
        .send('account=User1&email=User1@example.com&password=12345&checkPassword=12345')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(400)
          expect(res.body.message).deep.to.equal(['所有欄位皆為必填！'])
          done()
        })
    })
    it('4.密碼與確認密碼不相符', (done) => {
      request(app)
        .post('/api/v1/users/register')
        .send('account=User1&name=User1&email=User1@example.com&password=12345&checkPassword=1234')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(400)
          expect(res.body.message).deep.to.equal(['密碼與確認密碼不相符!'])
          done()
        })
    })
    it('5.暱稱字數超出上限', (done) => {
      request(app)
        .post('/api/v1/users/register')
        .send('account=User1&name=席勒在過去曾經講過，只有絕望的賭鬼才肯把全部所有作孤注的一擲。一個商人如果把他的全部財產裝在一隻船上，人家就管他叫冒失鬼。這句話令我不禁感慨問題的迫切性。需要考慮周詳名字的影響及因應對策。&email=User1@example.com&password=12345&checkPassword=12345')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(400)
          expect(res.body.message).deep.to.equal(['暱稱字數超出上限！'])
          done()
        })
    })
    it('6.email 輸入錯誤', (done) => {
      request(app)
        .post('/api/v1/users/register')
        .send('account=User1&name=User1&email=User1&password=12345&checkPassword=12345')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(400)
          expect(res.body.message).deep.to.equal(['email 輸入錯誤!'])
          done()
        })
    })
    it('7.帳號已重複註冊', (done) => {
      User.create({ account: 'User1', name: 'User1', email: 'User1@example.com', password: 12345, checkPassword: 12345 })
        .then(() => {
          request(app)
            .post('/api/v1/users/register')
            .send('account=User1&name=User1&email=User1@aaa.com&password=12345&checkPassword=12345')
            .set('Accept', 'application/json')
            .end((err, res) => {
              if (err) return done(err)
              expect(res.body.status).to.equal(400)
              expect(res.body.message).deep.to.equal(['帳號已重複註冊!'])
              done()
            })
        })
    })
    it('8.email 已重複註冊', (done) => {
      User.create({ account: 'User1', name: 'User1', email: 'User1@example.com', password: 12345, checkPassword: 12345 })
        .then(() => {
          request(app)
            .post('/api/v1/users/register')
            .send('account=User2&name=User1&email=User1@example.com&password=12345&checkPassword=12345')
            .set('Accept', 'application/json')
            .end((err, res) => {
              if (err) return done(err)
              expect(res.body.status).to.equal(400)
              expect(res.body.message).deep.to.equal(['email 已重複註冊!'])
              done()
            })
        })
    })
    afterEach(async () => {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
      await User.destroy({ where: {}, truncate: true, force: true })
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    })
  })
})
describe('# login', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await User.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    await User.create({
      account: 'User1',
      name: 'User1',
      email: 'User1@example.com',
      password: await bcrypt.hash('12345', 10)
    })
  })
  context('#successfully', () => {
    it('9.成功回傳api', (done) => {
      request(app)
        .post('/api/v1/users/login')
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
    it('10.當有欄位沒有填', (done) => {
      request(app)
        .post('/api/v1/users/login')
        .send('account=&password=12345')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(400)
          expect(res.body.message).deep.to.equal(['所有欄位皆為必填！'])
          done()
        })
    })
    it('11.帳號尚未註冊', (done) => {
      request(app)
        .post('/api/v1/users/login')
        .send('account=User2&password=12345')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(401)
          expect(res.body.message).to.equal('帳號尚未註冊！')
          done()
        })
    })
    it('12.帳號或密碼錯誤', (done) => {
      request(app)
        .post('/api/v1/users/login')
        .send('account=User1&password=1234')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(401)
          expect(res.body.message).to.equal('帳號或密碼錯誤！')
          done()
        })
    })
  })
  afterEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    await User.destroy({ where: {}, truncate: true, force: true })
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
  })
})

