let request = require('supertest');
request('http://127.0.0.1:3001');
require('dotenv').config();
const app = require("../app.js");
const Invitation = require('../models/invitation');
const User = require('../models/user');

describe('Invitation API create and send invitation', () => {

    const email = 'test1005@t.com';
    let token;
    let referralId;
  
    beforeAll((done) => {
      jest.setTimeout(100000);
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
                  referralId = resp.body.referralId;
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
      jest.setTimeout(50000);
      User.findOneAndDelete({email}, function(err, doc) {
        if (err) {
          console.error('err', err);
          done();
        }
        if (doc) {
          done();
        }
      })
    });

    test('POST should fail for empty recipients array', (done) => {
      jest.setTimeout(100000);
      request(app)
      .post(`/invitations/user/:email`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({"toEmailAr": [],
          referralId
      })
      .expect(400, done)
    })

    test('POST should fail for recipients array with invalid email', (done) => {
      jest.setTimeout(70000);
      request(app)
      .post(`/invitations/user/:email`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({"toEmailAr": ['inv@', 'test@t'],
          referralId
      })
      .expect(400, done)
    })  
})

describe('Invitation API create and send internal invitation', () => {
  const email = 'test1006@t.com';
  const email2 = 'test1007@t.com';
  const email3 = 'test1008@t.com';
  let token;
  let referralId;

  beforeAll((done) => {
    jest.setTimeout(170000);
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
                referralId = resp.body.referralId;
                request(app)
                .post('/user/register')
                .set('Content-Type', 'application/json')
                .send({email: email2,
                  "password": "testPassword10&",
                  "confirmPassword": "testPassword10&",
                  "language": "english"
                })
                .then(resp => {
                  request(app)
                  .post('/user/register')
                  .set('Content-Type', 'application/json')
                  .send({email: email3,
                    "password": "testPassword10&",
                    "confirmPassword": "testPassword10&",
                    "language": "english"
                  })
                  .then(resp => {
                    done();
                  })
                })
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
    jest.setTimeout(120000);
    Invitation.findOneAndDelete({"from_user_email": email, "to_user_email": email2}, function(err, doc) {
      if (err) {
        console.error('err', err);
        done();
      }
      Invitation.findOneAndDelete({"from_user_email": email, "to_user_email": email3}, function(err, doc) { 
        if (err) {
          console.error('err', err);
          done();
        }
        User.findOneAndDelete({email}, function(err, doc) {
          if (err) {
            console.error('err', err);
            done();
          }
          User.findOneAndDelete({email: email2}, function(err, doc) {
            if (err) {
              console.error('err', err);
              done();
            }
            User.findOneAndDelete({email: email3}, function(err, doc) {
              if (err) {
                console.error('err', err);
                done();
              }
              done();
            })
          })
        })
      })
    })
  });

  test('POST should pass for users who are registered (2)', (done) => {
    jest.setTimeout(70000);
    request(app)
    .post(`/invitations/user/${email}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send({"toEmailAr": [email2],
        referralId
    })
    .expect(200, done)
  })

  //passes because email3 does not have an invitation yet but 
  //email2 already has an invitation so only 1 invite is created
  test('POST should pass for users who are registered (3)', (done) => {
    jest.setTimeout(70000);
    request(app)
    .post(`/invitations/user/${email}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send({"toEmailAr": [email2, email3],
        referralId
    })
    .expect(200, done)
  })

  test('POST should pass for email', (done) => {
    jest.setTimeout(70000);
    request(app)
    .post(`/invitations/user/${email}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send({"toEmailAr": [process.env.QA_TEST_EMAIL1],
        referralId
    })
    .expect(200, done)
  })

  test('POST should pass for email (2)', (done) => {
    jest.setTimeout(70000);
    request(app)
    .post(`/invitations/user/${email}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send({"toEmailAr": [process.env.QA_TEST_EMAIL1, process.env.QA_TEST_EMAIL2],
        referralId
    })
    .expect(200, done)
  })
})

describe('Invitation API create and send internal and external invitation', () => {
  const email = 'test1010@t.com';
  const email2 = 'test1011@t.com';
  const email3 = 'test1012@t.com';
  let token;
  let referralId;

  beforeAll((done) => {
    jest.setTimeout(170000);
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
                referralId = resp.body.referralId;
                request(app)
                .post('/user/register')
                .set('Content-Type', 'application/json')
                .send({email: email2,
                  "password": "testPassword10&",
                  "confirmPassword": "testPassword10&",
                  "language": "english"
                })
                .then(resp => {
                  request(app)
                  .post('/user/register')
                  .set('Content-Type', 'application/json')
                  .send({email: email3,
                    "password": "testPassword10&",
                    "confirmPassword": "testPassword10&",
                    "language": "english"
                  })
                  .then(resp => {
                    done();
                  })
                })
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
    jest.setTimeout(120000);
    Invitation.findOneAndDelete({"from_user_email": email, "to_user_email": email2}, function(err, doc) {
      if (err) {
        console.error('err', err);
        done();
      }
      Invitation.findOneAndDelete({"from_user_email": email, "to_user_email": email3}, function(err, doc) { 
        if (err) {
          console.error('err', err);
          done();
        }
        User.findOneAndDelete({email}, function(err, doc) {
          if (err) {
            console.error('err', err);
            done();
          }
          User.findOneAndDelete({email: email2}, function(err, doc) {
            if (err) {
              console.error('err', err);
              done();
            }
            User.findOneAndDelete({email: email3}, function(err, doc) {
              if (err) {
                console.error('err', err);
                done();
              }
              done();
            })
          })
        })
      })
    })
  });

  test('POST should pass for combination of registered and unregistered users (4)', (done) => {
    jest.setTimeout(70000);
    request(app)
    .post(`/invitations/user/${email}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send({"toEmailAr": [email2, email3, process.env.QA_TEST_EMAIL1,
      process.env.QA_TEST_EMAIL2],
        referralId
    })
    .expect(200, done)
  })
})

describe('Invitation API create and send internal invitation', () => {
  const email = 'test1015@t.com';
  const email2 = 'test1016@t.com';
  let token;
  let referralId;

  beforeAll((done) => {
    jest.setTimeout(170000);
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
                referralId = resp.body.referralId;
                request(app)
                .post('/user/register')
                .set('Content-Type', 'application/json')
                .send({email: email2,
                  "password": "testPassword10&",
                  "confirmPassword": "testPassword10&",
                  "language": "english"
                })
                .then(resp => {
                  done();
                })
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
    jest.setTimeout(120000);
    Invitation.findOneAndDelete({"from_user_email": email, "to_user_email": email2}, function(err, doc) {
      if (err) {
        console.error('err', err);
        done();
      }
      User.findOneAndDelete({email}, function(err, doc) {
        if (err) {
          console.error('err', err);
          done();
        }
        User.findOneAndDelete({email: email2}, function(err, doc) {
          if (err) {
            console.error('err', err);
            done();
          }
        })
      })
    })
  });

  test('POST should pass for combination of registered and unregistered users (4)', (done) => {
    jest.setTimeout(140000);
    request(app)
    .post(`/invitations/user/${email}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send({"toEmailAr": [email2],
        referralId
    })
    .then(resp => {
      request(app)
      .post(`/invitations/user/${email}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({"toEmailAr": [email2],
          referralId
      })
      .expect(400, done)
    })
  })
})






describe('Invitation API get invitations sent to user', () => {
  const email = 'test1020@t.com';
  const email2 = 'test1021@t.com';
  let token;
  let referralId;

  beforeAll((done) => {
    jest.setTimeout(170000);
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
                referralId = resp.body.referralId;
                request(app)
                .post('/user/register')
                .set('Content-Type', 'application/json')
                .send({email: email2,
                  "password": "testPassword10&",
                  "confirmPassword": "testPassword10&",
                  "language": "english"
                })
                .then(resp => {
                  done();
                })
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
    jest.setTimeout(120000);
    Invitation.findOneAndDelete({"from_user_email": email, "to_user_email": email2}, function(err, doc) {
      if (err) {
        console.error('err', err);
        done();
      }
      User.findOneAndDelete({email}, function(err, doc) {
        if (err) {
          console.error('err', err);
          done();
        }
        User.findOneAndDelete({email: email2}, function(err, doc) {
          if (err) {
            console.error('err', err);
            done();
          }
        })
      })
    })
  });

  test('GET should pass for invitation from user (no invitations)', (done) => {
    jest.setTimeout(140000);
      request(app)
      .get(`/invitations/user/${email}`)
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(200, done)
  })

  test('GET should pass for invitation from user (1 invitation)', (done) => {
    jest.setTimeout(170000);
    request(app)
    .post(`/invitations/user/${email}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send({"toEmailAr": [email2],
        referralId
    })
    .then(resp => {
      request(app)
      .get(`/invitations/user/${email}`)
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(200, done)
    })
  })
})
