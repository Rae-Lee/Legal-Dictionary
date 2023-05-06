module.exports = {
  development: {
    username: 'root',
    password: 'password',
    database: 'law_memo',
    host: '127.0.0.1',
    port: 3306,
    encoding: 'utf8mb4',
    dialect: 'mysql'
  },
  test: {
    username: 'root',
    password: 'password',
    database: 'law_memo_test',
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
    logging: false
  },
  production: {
    use_env_variable: 'LAW_MEMO_URL',
    dialect: 'mysql',
    logging: false
  },
  travis: {
    username: 'travis',
    database: 'law_memo_workplace',
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: false
  }
}
