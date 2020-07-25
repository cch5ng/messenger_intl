let request = require('supertest');
request('http://127.0.0.1:3001');
const app = require("../app.js");
//const { expect } = require('chai');
const User = require('../models/user');

describe('User API endpoints', () => {

  afterEach((done) => {
    jest.setTimeout(30000);

    User.findOneAndDelete({"email": "test999@t.com"}, function(err, doc) {
      if (err) {
        console.error('err', err);
        done()
      }
      if (doc) {
        console.log('doc', doc)
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


  test('should test POST /register able to register successfully', (done) => {
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


})

