let request = require('supertest');
request('http://127.0.0.1:3001');
const app = require("../app.js");
const User = require('../models/user');

describe('User API register endpoint', () => {

  afterAll((done) => {
    jest.setTimeout(30000);

    User.findOneAndDelete({"email": "test999@t.com"}, function(err, doc) {
      if (err) {
        console.error('err', err);
        done()
      }
      if (doc) {
        //console.log('doc', doc)
        done()
      }
    })
  });

  test('should test POST /register confirmPassword matches password', (done) => {
    request(app)
      .post('/user/register')
      .set('Content-Type', 'application/json')
      .send({"email": "test999@t.com",
        "password": "testPassword10&",
        "confirmPassword": "testPassword",
        "language": "english"
      })
      .expect(400, done)
  });

  test('should test POST /register empty email', (done) => {
    request(app)
      .post('/user/register')
      .set('Content-Type', 'application/json')
      .send({"email": "",
        "password": "testPassword10&",
        "confirmPassword": "testPassword",
        "language": "english"
      })
      .expect(400, done)
  });

  test('should test POST /register valid email', (done) => {
    request(app)
      .post('/user/register')
      .set('Content-Type', 'application/json')
      .send({"email": "invalid@",
        "password": "testPassword10&",
        "confirmPassword": "testPassword",
        "language": "english"
      })
      .expect(400, done)
  });

  test('should test POST /register empty password', (done) => {
    request(app)
      .post('/user/register')
      .set('Content-Type', 'application/json')
      .send({"email": "test999@t.com",
        "password": "",
        "confirmPassword": "testPassword",
        "language": "english"
      })
      .expect(400, done)
  });

  test('should test POST /register password length', (done) => {
    request(app)
      .post('/user/register')
      .set('Content-Type', 'application/json')
      .send({"email": "test999@t.com",
        "password": "1234",
        "confirmPassword": "testPassword",
        "language": "english"
      })
      .expect(400, done)
  });

  test('should test POST /register able to register successfully', (done) => {
    jest.setTimeout(30000);
    request(app)
      .post('/user/register')
      .set('Content-Type', 'application/json')
      .send({"email": "test999@t.com",
        "password": "testPassword10&",
        "confirmPassword": "testPassword10&",
        "language": "english"
      })
      .expect(201, done)
  });

});

describe('User API login endpoints', () => {

  beforeAll((done) => {
    jest.setTimeout(30000);
    request(app)
    .post('/user/register')
    .set('Content-Type', 'application/json')
    .send({"email": "test999@t.com",
      "password": "testPassword10&",
      "confirmPassword": "testPassword10&",
      "language": "english"
    })
    .then(() => done())
  })

  afterAll((done) => {
    jest.setTimeout(30000);

    User.findOneAndDelete({"email": "test999@t.com"}, function(err, doc) {
      if (err) {
        console.error('err', err);
        done()
      }
      if (doc) {
        done()
      }
    })
  });

  test('should test POST /login reject user with no registered', (done) => {
    request(app)
      .post('/user/login')
      .set('Content-Type', 'application/json')
      .send({"email": "test9999@t.com",
        "password": "test"
      })
      .expect(404, done)
  });

  test('should test POST /login empty email', (done) => {
    request(app)
      .post('/user/login')
      .set('Content-Type', 'application/json')
      .send({"email": "",
        "password": "testPassword10&"
      })
      .expect(400, done)
  });

  test('should test POST /login valid email', (done) => {
    request(app)
      .post('/user/login')
      .set('Content-Type', 'application/json')
      .send({"email": "invalid@",
        "password": "testPassword10&"
      })
      .expect(400, done)
  });

  test('should test POST /login empty password', (done) => {
    request(app)
      .post('/user/login')
      .set('Content-Type', 'application/json')
      .send({"email": "test999@t.com",
        "password": ""
      })
      .expect(400, done)
  });

  test('should test POST /login able to login successfully', (done) => {
    jest.setTimeout(30000);
    request(app)
      .post('/user/login')
      .set('Content-Type', 'application/json')
      .send({"email": "test999@t.com",
        "password": "testPassword10&"
      })
      .expect(200)
      .then(resp => {
        expect(resp.body.token.length).not.toBe(0);
        done();
      })
  });

});