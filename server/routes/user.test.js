let request = require('supertest');
request('http://127.0.0.1:3001');
const app = require("../app.js");
const User = require('../models/user');
const Invitation = require('../models/invitation');

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
    jest.setTimeout(40000);
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
  let email = 'test1001@t.com';

  beforeAll((done) => {
    jest.setTimeout(30000);
    request(app)
    .post('/user/register')
    .set('Content-Type', 'application/json')
    .send({email,
      "password": "testPassword10&",
      "confirmPassword": "testPassword10&",
      "language": "english"
    })
    .then(() => done())
  })

  afterAll((done) => {
    jest.setTimeout(30000);

    User.findOneAndDelete({email}, function(err, doc) {
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
      .send({email,
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
      .send({email,
        "password": ""
      })
      .expect(400, done)
  });

  test('should test POST /login able to login successfully', (done) => {
    jest.setTimeout(30000);
    request(app)
      .post('/user/login')
      .set('Content-Type', 'application/json')
      .send({email,
        "password": "testPassword10&"
      })
      .expect(200)
      .then(resp => {
        expect(resp.body.token.length).not.toBe(0);
        done();
      })
  });

});

describe('User API misc endpoints', () => {
  const email = 'test1002@t.com';
  let token;

  beforeAll((done) => {
    jest.setTimeout(30000);
    request(app)
    .post('/user/register')
    .set('Content-Type', 'application/json')
    .send({email,
      "password": "testPassword10&",
      "confirmPassword": "testPassword10&",
      "language": "english"
    })
    .then(resp => {
      if (resp.statusCode === 201) {
        request(app)
        .post('/user/login')
        .set('Content-Type', 'application/json')
        .send({email,
          "password": "testPassword10&"
        })
        .then(resp => {
          if (resp && resp.body && resp.body.token && resp.body.token.length) {
            token = resp.body.token;
            done();
          }
        })
      }
    })
  })

  afterAll((done) => {
    jest.setTimeout(30000);
    User.findOneAndDelete({email}, function(err, doc) {
      if (err) {
        console.error('err', err);
        done()
      }
      if (doc) {
        done()
      }
    })
  });

  test('should test GET /:email/referralId', (done) => {
    request(app)
      .get(`/user/${email}/referralId`)
      .set('Content-Type', 'application/json')
      .set('Authorization',  `Bearer ${token}`)
      .send()
      .expect(200, done)
  });

  test('should test GET /:email/language', (done) => {
    request(app)
      .get(`/user/${email}/language`)
      .set('Content-Type', 'application/json')
      .set('Authorization',  `Bearer ${token}`)
      .send()
      .expect(200, done)
  });

});

describe('User API registration with referralId', () => {
  const email = 'test1003@t.com';
  const email2 = 'test1004@t.com';
  let token;
  let referralId;

  beforeAll((done) => {
    jest.setTimeout(30000);
    request(app)
    .post('/user/register')
    .set('Content-Type', 'application/json')
    .send({email,
      "password": "testPassword10&",
      "confirmPassword": "testPassword10&",
      "language": "english"
    })
    .then(resp => {
      if (resp.statusCode === 201) {
        request(app)
        .post('/user/login')
        .set('Content-Type', 'application/json')
        .send({email,
          "password": "testPassword10&"
        })
        .then(resp => {
          if (resp && resp.body && resp.body.token && resp.body.token.length) {
            token = resp.body.token;
            request(app)
            .get(`/user/${email}/referralId`)
            .set('Content-Type', 'application/json')
            .set('Authorization',  `Bearer ${token}`)
            .send()
            .then(resp => {
              if (resp && resp.body && resp.body.referralId && resp.body.referralId.length) {
                referralId = resp.body.referralId
                done();
              } else {
                done();
              }
            })
          }
        })
      }
    })
  })

  afterAll((done) => {
    jest.setTimeout(70000);
    User.findOneAndDelete({email}, function(err, doc) {
      if (err) {
        console.error('err', err);
        done()
      }
      if (doc) {
        User.findOneAndDelete({"email": email2}, function(err, doc) {
          if (err) {
            console.error('err', err);
            done()
          }
          if (doc) {
            Invitation.findOneAndDelete({"from_user_email": email, "to_user_email": email2}, function(err, doc) {
              if (err) {
                console.error('err', err);
                done();
              }
              if (doc) {
                done();
              }
            })
          }
        })
      }
    })
  });

  test('should test POST /register/referral', (done) => {
    jest.setTimeout(50000);
    request(app)
      .post(`/user/register/referral`)
      .set('Content-Type', 'application/json')
      .set('Authorization',  `Bearer ${token}`)
      .send({referralId, 
        email: email2, 
        password: '13579000',
        confirmPassword: '13579000',
        language: 'english'})
      .expect(201, done)

  });

});