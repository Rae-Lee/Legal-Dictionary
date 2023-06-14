<p align=center>
<img src="https://raw.githubusercontent.com/Rae-Lee/Legal-Dictionary-Frontend/main/src/assets/logo.png">
</p>
<p align=center>
<a target="_blank" href="https://app.travis-ci.com/github/Rae-Lee/Legal-Dictionary" title="Build Status"><img src="https://img.shields.io/travis/com/Rae-Lee/Legal-Dictionary"></a>
<a target="_blank" href="http://nodejs.org/download/" title="Node version"><img src="https://img.shields.io/badge/node.js-%3E=_6.0-green.svg"></a>
<a target="_blank" href="https://opensource.org/licenses/MIT" title="License: MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg"></a>
<a target="_blank" href="http://makeapullrequest.com" title="PRs Welcome"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

> Your helpful assistant in writing a complaint letter.

Providing with keyword search, find relevant legal provisions and the most cited judgments and take notes.
Best website for those who want to write a simple complaint letter but don't know where to start.

Website: https://rae-lee.github.io/Legal-Dictionary-Frontend

Default account:

| Name  |  Password |                                                                                                                                               
| ----- |---------- | 
| user1 | 12345678  |
| user2 | 12345678  |


Front-end Repo: [Legal-Dictionary-Frontend](https://github.com/Rae-Lee/Legal-Dictionary-Frontend) Click the link and you can read usage guide there.

Law data came from [全國法規資料庫](https://law.moj.gov.tw/) APIs.

Judgements data was obtained from scraping 司法院裁判書系統 website by [legal-dictinary-crawler](https://github.com/Rae-Lee/legal_dictionary_crawler).


## :book: Feature

![](https://raw.githubusercontent.com/Rae-Lee/Legal-Dictionary-Frontend/main/src/assets/feature1.png)  |  ![](https://raw.githubusercontent.com/Rae-Lee/Legal-Dictionary-Frontend/main/src/assets/feature2.png)


## :floppy_disk: Development

* It's simple to run `Legal-Dictionary` on your local computer.  
* The following is step-by-step instruction.

### 1. Get Started

```
$ git clone https://github.com/Rae-Lee/Legal-Dictionary.git
$ cd Legal-Dictionary
$ npm install
```

### 2. Connect to `MySQL`

Download `mysql2`

```
$ npm install mysql2
```

Or use `Docker` without downloading.

```
$ docker pull mysql:latest 
$ docker run -name [your image name] -p 3306:3306 -e MYSQL_ROOT_PASSWORD=[your password] -d
```

Create a database in your `MySQL` .

```
$ winpty docker exec -it [your image name] bash
$ mysql -u root -p
$ CREAT DATABASE [your database name];
$ use [your database name]
```

Modify the values of username, password and database in config/config.js to connect.
And fill in `.env.example`

### 3. Fill in `.env.example` 

Add `JWT_SECRET_KEY` to `.env.example`.

### 4. Run migrations and seeders

```
$ npx sequelize db:migrate
$ npx sequelize db:seed:all
```

### 5. Run the application

```
npm run dev
```

Execute successfully if seeing following message
```
It is running on http://localhost:3000
```

### 6. Test the application

```
npm run test
```

## ERD
![](/erd.png)

## API DOC

https://lean-scooter-300.notion.site/Legal-Dictionary-API-DOC-42633b09398b4cb08407e16763ef0cef?pvs=4

## License

MIT © [rae-lee](https://github.com/rae-lee)


