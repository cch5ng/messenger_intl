let request = require('supertest');
request('http://127.0.0.1:3001');
require('dotenv').config();
const app = require("../app.js");
const Invitation = require('../models/invitation');
const User = require('../models/user');
const Conversation = require('../models/conversation');

describe('Invitation API get contacts', () => {
  const email = 'test1030@t.com';
  const email2 = 'test1031@t.com';
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
                  "language": "spanish"
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

  //TODO add clear any created conversations
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

  test('POST conversation should fail where users are not contacts', (done) => {
    const emailsAr = [email, email2];
    const friendLanguages = ['spanish'];
    jest.setTimeout(140000);
    request(app)
      .post(`/conversations`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({emailsAr,
        friendLanguages
      })
      .expect(400, done)
  })

  test.skip('GET should pass for contacts (1 contact)', (done) => {
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
        .put(`/invitations/user/${email2}/approve`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({from_email: email})
        .then(resp => {
          request(app)
          .get(`/invitations/user/${email}/contacts`)
          .set('Authorization', `Bearer ${token}`)
          .send()
          .expect(200, done)    
        })
      })
  })
})

