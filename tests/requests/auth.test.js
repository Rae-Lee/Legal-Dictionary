process.env.NODE_ENV = 'travis'
const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
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
          expect(res.body.data.role).to.equal('user')
          expect(res.body.data).to.not.have.property('password')
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
        })
      done()
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
    it('9.註冊為管理員帳號', (done) => {
      request(app)
        .post('/api/v1/users/register')
        .send('account=root&name=root&email=root@example.com&password=12345&checkPassword=12345&role=admin')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err)
          expect(res.body.status).to.equal(200)
          expect(res.body.data.role).to.equal('user')
          done()
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
    it('10.成功回傳api', (done) => {
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
    it('11.當有欄位沒有填', (done) => {
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
    it('12.帳號尚未註冊', (done) => {
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
    it('13.帳號或密碼錯誤', (done) => {
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
    it('14.使用管理員帳號登入前台', (done) => {
      User.create({ account: 'root', role:'admin',password: bcrypt.hash('12345', 10) })
        .then(() => {
          request(app)
            .post('/api/v1/users/login')
            .send('account=root&password=12345')
            .set('Accept', 'application/json')
            .end((err, res) => {
              if (err) return done(err)
              expect(res.body.status).to.equal(401)
              expect(res.body.message).to.equal('帳號尚未註冊！')
            })
        })
      done()
    })
    it('15.帳號已列入黑名單', (done) => {
      User.create({ account: 'User2', password: bcrypt.hash('12345', 10), deletedAt: '2023-03-26 14:00' })
        .then(() => {
          request(app)
            .post('/api/v1/users/login')
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