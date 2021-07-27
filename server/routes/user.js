const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require("passport");
const User = require('../models/user');
const Invitation = require('../models/invitation');

const registrationValidator = require('../controllers/userRegistrationValidator');
const loginValidator = require('../controllers/userLoginValidator');
const {sendEmailForPasswordChange} = require('../util/sendgrid_helpers');

router.post('/register', (req, res) => {
  const {validationErrors, isRegistrationValid} = registrationValidator(req.body);

  if(!isRegistrationValid) {
    return res.status(400).json(validationErrors);
  }

  User.findOne({ email: req.body.email })
      .then(user => {
        if(user) {
          return res.status(400).json({email: "Email you entered already exists"});
        }
        else {
          const newUser = new User({
            email: req.body.email,
            password: req.body.password,
            language: req.body.language
          });
          bcrypt.genSalt(12, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if(err) throw err;
              newUser.password = hash;
              newUser.save().then(user => res.status(201).json({ success: `${user.email} successfully registered`}))
                            .catch(err => console.error(err));
            });
          });
        }
      });
});

router.post('/login', (req, res) => {
  const {validationErrors, isLoginValid} = loginValidator(req.body);

  if(!isLoginValid) {
    return res.status(400).json(validationErrors);
  }

  User.findOne({ email: req.body.email })
      .then(user => {
        if(!user) {
          return res.status(404).json({ missingData: "User not found"});
        }
        bcrypt.compare(req.body.password, user.password)
              .then(isPasswordValid => {
                if(isPasswordValid) {
                  const payload = {
                    id: user._id,
                    email: user.email
                  };
                  jwt.sign(payload, process.env.SECRET_OR_KEY, {
                    expiresIn: 86400 //expires in 1 day
                  },
                  (err, token) => {
                    res.json({
                      success: `${user.email} is logged in successfully`,
                      token: `${token}`,
                      user: {email: user.email,
                        language: user.language,
                        referralId: user.referral_id.toString(),
                        id: user._id.toString()},
                      email: user.email
                    });
                  }
                );
               }
               else {
                 return res.status(401).json({ validationError: "Invalid login credentials"});
               }
              });
      });
});

router.get("/:fromEmail/referralId",
  passport.authenticate('jwt', { session: false }),
  function(req, res, next) {
    const {fromEmail} = req.params
    User.findOne({email: fromEmail}, function(err, user) {
      if (err) return console.error(err);
      if (!user) {
        res.status(500).json({type: 'error', message: 'A user with that email could not be found.'})
      }
      if (user) {
        res.json({type: 'success', referralId: user.referral_id.toString()})
      }
    });
  }
);

router.get("/:fromEmail/language",
  passport.authenticate('jwt', { session: false }),
  function(req, res, next) {
    const {fromEmail} = req.params
    User.findOne({email: fromEmail}, function(err, user) {
      if (err) return console.error(err);
      if (!user) {
        res.status(500).json({type: 'error', message: 'A user with that email could not be found.'})
      }
      if (user) {
        res.json({type: 'success', language: user.language})
      }
    });
  }
);

router.post('/register/referral',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
  const {validationErrors, isRegistrationValid} = registrationValidator(req.body);
  const {referralId, email, password, language} = req.body;

  if(!isRegistrationValid) {
    return res.status(400).json(validationErrors);
  }

  User.findOne({ email })
      .then(user => {
        if(user) {
          return res.status(400).json({email: "The email you entered already exists"});
        }
        else {
          const newUser = new User({
            email,
            password,
            language
          });
          bcrypt.genSalt(12, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if(err) throw err;
              newUser.password = hash;
              newUser.save(function(err) {
                if (err) return console.error('Invitation recipient could not be registered', err);
                User.findOne({referral_id: mongoose.Types.ObjectId(referralId)},
                  function(err, user) {
                    if (err) return console.error('Invitation sender could not be found', err)
                    if (user._id) {
                      let from_user_email = user.email;
                      let invite = new Invitation({from_user_email, to_user_email: email});
                      invite.save()
                        .then(invitation => {
                          res.status(201).json({type: 'success', message: `${email} was  registered. An invitation from ${from_user_email} was created.`})
                        })
                        .catch(err => console.error(`A new invitation could not be created for ${email}.`, err));  
                    }
                  }
                )
              });
            });
          })
        }
      });
});

router.post('/passwordChangeEmail',
  passport.authenticate('jwt', { session: false }),
  function(req, res, next) {
    let today = new Date();
    today.setDate(today.getDate() + 1);
    const {email} = req.body;    
    const query = {email: email};
    const update = {
      $set: {
        password_change_expiration_date_time: today
      }
    }
    const options = { returnNewDocument: true };

    return User.findOneAndUpdate(query, update, options)
      .then(updatedDocument => {
        if(updatedDocument) {
          const {password_change_url_id, email} = updatedDocument;
          sendEmailForPasswordChange({email, password_change_url_id})
            .then(resp => {
              if (resp[0].statusCode === 202) {
                res.status(201).json({type: 'success', message: `An email with password reset link was sent.`})
              } else {
                res.status(200).json({type: 'error', message: `An email to reset the password could not be delivered. Please check the email spelling and try again.`})
              }
            })
            .catch(err => {
              console.error('Sendgrid password change sending error:', err)
              if (err.response) {
                const {message, code, response} = err;
                const {headers, body} = response;                          
                console.error(body);
              }
            })
        } else {
          res.status(400).json({type: 'error', message: `That email address could not be found.`})
        }
      })
      .catch(err => console.error(`Failed to find and update document: ${err}`))
  }
)

router.put('/passwordChange/:password_change_url_id',
  passport.authenticate('jwt', { session: false }),
  function(req, res, next) {
    const {password, passwordConfirm} = req.body;
    const {password_change_url_id} = req.params;

    User.findOne({password_change_url_id: password_change_url_id})
      .then(user => {
        if (user) {
          const {password_change_expiration_date_time} = user;
          let expirationDate = new Date(password_change_expiration_date_time);
          let curDate = new Date();

          if (curDate < expirationDate) {
            //need to verify that password link has not expired
            //then can update the password
            bcrypt.genSalt(12, (err, salt) => {
              bcrypt.hash(password, salt, (err, hash) => {
                if(err) throw err;
                const query = {password_change_url_id: password_change_url_id};
                const update = {
                  $set: {
                    password: hash
                  }
                }
                const options = { returnNewDocument: true };
    
                return User.findOneAndUpdate(query, update, options)
                  .then(updatedDocument => {
                    if (updatedDocument) {
                      res.status(201).json({type: 'success', message: `The password was changed successfully.`})
                    }
                  })
                  .catch(err => console.error(`Failed to find and update document: ${err}`))    
              })
            })
          } else {
            res.status(200).json({type: 'error', message: `The link to change the password has expired. Please request another password change link.`})
          }
        } else {
          res.status(200).json({type: 'error', message: `The user could not be found.`})
        }

      })
      .catch(err => console.error(`Failed to update the password: ${err}`))

  }
)


module.exports = router;
