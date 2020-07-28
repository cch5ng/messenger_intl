let request = require('supertest');
request('http://127.0.0.1:3001');
const app = require("../app.js");
const Invitation = require('../models/invitation');
const { TestScheduler } = require('jest');

describe('Invitation API create and send invitation', () => {

    const email = 'test1005@t.com';
    let token;
    let referralId;
  
    beforeAll((done) => {
      jest.setTimeout(50000);
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
      jest.setTimeout(50000);
      User.findOneAndDelete({email}, function(err, doc) {
        if (err) {
          console.error('err', err);
          done()
        }
        if (doc) {
          done()
          // User.findOneAndDelete({"email": "test1000@t.com"}, function(err, doc) {
          //   if (err) {
          //     console.error('err', err);
          //     done()
          //   }
          //   if (doc) {
          //     done()
          //   }
          // })
        }
      })
    });

    test('POST should fail for empty recipients array', (done) => {
      jest.setTimeout(50000);
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
      jest.setTimeout(50000);
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