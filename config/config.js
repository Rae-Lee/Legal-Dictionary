if (process.env.NODE_ENV.trim() === 'development') {
  require('dotenv').config()
}
if (process.env.NODE_ENV.trim() === 'test') {
  require('dotenv').config({ path: `${process.cwd()}/.env-test` })
}
module.exports = {
  development: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    host: process.env.DB_HOST,
    dialect: 'mysql'
  },
  test: {
    username: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: 'root',
    password: null,
    database: 'database_production',
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  travis: {
    username: 'travis',
    database: 'law_memo_workplace',
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: false
  }
}
