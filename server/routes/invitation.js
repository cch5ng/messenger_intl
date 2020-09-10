const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const validator = require("validator");
const Invitation = require("../models/invitation");
const User = require("../models/user");
const {sendEmail, getSuccessCount} = require("../util/sendgrid_helpers")
const router = express.Router();
const invitationRejectApproveHelper = require('../controllers/invitationRejectApproveHelper');
const {getInviteSendSuccessMessage, getInviteNotSentMessage, getEmailSendMixedMessage} = require("../util");

//send an invite to user
router.post("/user/:fromEmail",
    passport.authenticate('jwt', { session: false }),
    function(req, res, next) {
        const {toEmailAr, referralId} = req.body;
        const {fromEmail} = req.params;
        let invalidEmails = [];
        let validEmails = [];
        let curUserEmails = [];
        let dupeInviteRecipients = [];
        let nonDupeInviteRecipients = [];
        let nonCurUserEmails = [];
        let inviteRecipients = [];
        let inviteCreatedInternalMessage = '';
        let inviteCreatedEmailMessage = '';
        let inviteNotCreatedEmailMessage = '';

        if (toEmailAr.length === 0) {
          return res.status(400).json({error: 'No email addresses for invitation recipients were provided.'})
        }
        toEmailAr.forEach(email => {
            if (validator.isEmail(email)) {
                validEmails.push(email);
            } else {
                invalidEmails.push(email);
            }
        });
        if (!validEmails.length) {
            return res.status(400).json({error: 'Email addresses for invitation recipients were invalid. Please check the spelling.'})
        } else {
            validEmails.forEach((to_email, idx) => {
                User.find({email: to_email}, function(err, user) {
                    if (err) console.error('unable to find user', err);
                    if (!user.length) {
                        nonCurUserEmails.push(to_email);
                    }
                    if (user.length) {
                        curUserEmails.push(to_email);
                    }
                    if (idx === validEmails.length - 1) {
                      //1 handle case where recipients include registered users and non registered
                        if (curUserEmails.length && nonCurUserEmails.length) {
                          //handle non registered users
                          sendEmail({from_email: fromEmail, 
                                      to_email_ar: nonCurUserEmails, 
                                      referral_id: referralId})
                            .then(resp => {
                              if (getSuccessCount(resp) === nonCurUserEmails.length) {
                                inviteRecipients = inviteRecipients.concat(nonCurUserEmails);
                              }
                              //handled registered users
                              //verify requested invite does not exist
                              let query = {};
                              let queryAr = [];
                              curUserEmails.forEach(toEmail => {
                                let queryObj1 = {};
                                let queryObj2 = {};
                                queryObj1.to_user_email = toEmail;
                                queryObj1.from_user_email = fromEmail;
                                queryAr.push(queryObj1);
                                queryObj2.to_user_email = fromEmail;
                                queryObj2.from_user_email = toEmail;
                                queryAr.push(queryObj2);
                              })
                              query['$or'] = queryAr;
                              Invitation.find(query, function(err, invitations) {
                                if (err) console.error('Could not find invitations during duplicate invites check', err);
                                //handle duplicate invitations
                                if (invitations && invitations.length) {
                                  invitations.forEach(invite => {
                                    if (dupeInviteRecipients.indexOf(invite.to_user_email) === -1 &&curUserEmails.indexOf(invite.to_user_email) > -1) {
                                        dupeInviteRecipients.push(invite.to_user_email);
                                      }
                                    if (invite.to_user_email === fromEmail &&
                                      dupeInviteRecipients.indexOf(invite.from_user_email) === -1 &&
                                      curUserEmails.indexOf(invite.from_user_email) > -1) {
                                        dupeInviteRecipients.push(invite.from_user_email);
                                      }
                                  });
                                  nonDupeInviteRecipients = curUserEmails.filter(email =>   dupeInviteRecipients.indexOf(email) === -1);
                                  if (nonDupeInviteRecipients.length) {
                                    let newInvites = nonDupeInviteRecipients.map(to_user_email => {return {to_user_email, from_user_email: fromEmail}});
                                    Invitation.insertMany(newInvites, function(err) {
                                      if (err) return console.error(err);
                                      inviteRecipients = inviteRecipients.concat(nonDupeInviteRecipients);
                                      res.json({ type: "success", 
                                        message: getEmailSendMixedMessage(inviteRecipients, dupeInviteRecipients)
                                      });
                                    })
                                  } else {
                                    res.json({ type: "success", 
                                      message: getEmailSendMixedMessage(inviteRecipients, dupeInviteRecipients)
                                    });
                                  }
                                } else if (invitations.length === 0) {
                                  let newInvites = curUserEmails.map(to_user_email => {return {to_user_email, from_user_email: fromEmail}});
                                  Invitation.insertMany(newInvites, function(err) {
                                    if (err) return console.error(err);
                                    inviteRecipients = inviteRecipients.concat(curUserEmails);
                                    res.json({ type: "success", 
                                      message: getEmailSendMixedMessage(inviteRecipients, dupeInviteRecipients)
                                    });
                                  })
                                }
                              })
                            })
                            .catch(err => {
                              console.error('Sendgrid email invitation sending error:', err)
                              if (err.response) {
                                const {message, code, response} = err;
                                const {headers, body} = response;                          
                                console.error(body);
                              }
                            })
                        } else if (curUserEmails.length) {
                          //handle only registered users
                          //verify requested invite does not exist
                          let query = {};
                          let queryAr = [];
                          curUserEmails.forEach(toEmail => {
                            let queryObj1 = {};
                            let queryObj2 = {};
                            queryObj1.to_user_email = toEmail;
                            queryObj1.from_user_email = fromEmail;
                            queryAr.push(queryObj1);
                            queryObj2.to_user_email = fromEmail;
                            queryObj2.from_user_email = toEmail;
                            queryAr.push(queryObj2);
                          })
                          query['$or'] = queryAr;
                          Invitation.find(query, function(err, invitations) {
                            if (err) console.error('Could not find invitations during duplicate invites check', err);
                            if (invitations && invitations.length) {
                              invitations.forEach(invite => {
                                if (dupeInviteRecipients.indexOf(invite.to_user_email) === -1 &&curUserEmails.indexOf(invite.to_user_email) > -1) {
                                    dupeInviteRecipients.push(invite.to_user_email);
                                  }
                                if (invite.to_user_email === fromEmail &&
                                  dupeInviteRecipients.indexOf(invite.from_user_email) === -1 &&
                                  curUserEmails.indexOf(invite.from_user_email) > -1) {
                                    dupeInviteRecipients.push(invite.from_user_email);
                                  }
                              });
                              nonDupeInviteRecipients = curUserEmails.filter(email =>   dupeInviteRecipients.indexOf(email) === -1);
                              if (nonDupeInviteRecipients.length) {
                                let newInvites = nonDupeInviteRecipients.map(to_user_email => {
                                  return {to_user_email, from_user_email: fromEmail}});
                                Invitation.insertMany(newInvites, function(err) {
                                  if (err) return console.error(err);
                                  res.status(200).json({ type: "success",
                                    message: getEmailSendMixedMessage(nonDupeInviteRecipients, dupeInviteRecipients)});
                                })
                              } else {
                                res.status(400).json({ type: "error",
                                  message: getInviteNotSentMessage(dupeInviteRecipients)})
                              }
                            } else if (invitations.length === 0) {
                              let newInvites = curUserEmails.map(to_user_email => {
                                return {to_user_email, from_user_email: fromEmail}});
                              Invitation.insertMany(newInvites, function(err, invitations) {
                                if (err) return console.error(err);
                                res.status(200).json({ type: "success", 
                                  message: getInviteSendSuccessMessage(curUserEmails)});
                              })
                            }
                          })
                        } else if (nonCurUserEmails.length) {
                          //handle all non registered users
                          sendEmail({from_email: fromEmail,
                                    to_email_ar: nonCurUserEmails, 
                                    referral_id: referralId})
                            .then(resp => {
                              if (getSuccessCount(resp) === nonCurUserEmails.length) {
                                res.json({ type: "success",
                                  message: getInviteSendSuccessMessage(nonCurUserEmails)});
                              }
                            })
                            .catch(err => {
                              console.error('Sendgrid email invitation sending error:', err)
                              if (err.response) {
                                const {message, code, response} = err;
                                const {headers, body} = response;                          
                                console.error(body);
                              }
                            })
                        }
                    }
                })
            })
        }
    }
);

//Returns invitation requests from the user
router.get("/user/:from_email",
    passport.authenticate('jwt', { session: false }),
    function(req, res, next) {
        const {from_email} = req.params;

        Invitation.find({"from_user_email": from_email, "approved": false, "rejected": {$ne: true}})
          .sort({createdOn: 1})
          .exec(function (err, invitations) {
            if (err) {
                return handleError(err);
            }
            if (invitations && invitations.length) {
                res.status(200).json({ type: "success", invitations})
            } else {
                res.status(200).json({ type: "success", message: "There are no pending invitations"})
            }
          }
        )
    }
);

// Returns pending invitations that were sent to the given user
router.get("/user/requests/:to_email",
    passport.authenticate('jwt', { session: false }),
    function(req, res, next) {
        const {to_email} = req.params;

        Invitation.find({"to_user_email": to_email, "approved": false, "rejected": {$ne: true}})
          .sort({createdOn: 1})
          .exec(function (err, invitations) {
            if (err) {
                return handleError(err);
            }
            if (invitations && invitations.length) {
                res.status(200).json({ type: "success", invitations})
            } else {
                res.status(200).json({ type: "success", message: "There are no pending invitation requests"})
            }
          }
        )
    }
);

//Returns contacts for the current user
router.get("/user/:to_email/contacts",
  passport.authenticate('jwt', { session: false }),
  function(req, res, next) {
    const {to_email} = req.params;
    let contactsLang = {};

    Invitation.find({
      $or: [
        {"to_user_email": to_email, "approved": true },
        {"from_user_email": to_email, "approved": true },
      ]
    }, function(err, invitations) {
      if (err) return console.error('Contacts could not be retrieved.', err);
      if (invitations && invitations.length) {
        let contacts = [];
        let returnCount = 0;
        contacts = invitations.map(invite => {
          return invite.to_user_email === to_email ? invite.from_user_email: invite.to_user_email;
        });
        //retrieve each contact's language
        contacts.forEach((contact, idx) => {
          User.find({email: contact}, 'language', function(err, user) {
            if (err) return console.error('Could not get contact language.', err);
            returnCount += 1;
            if (user && user.length) {
              if (!contactsLang[contact]) {
                contactsLang[contact] = {language: user[0].language};
                if (returnCount === contacts.length) {
                  res.status(200).json({type: 'success', contacts: contactsLang});
                }
              }
            }
          })
        })

        //TODO TEST if this breaks providing language with contacts
        //if search query provided
        // if(req.query.q){
        //   contacts = contacts.filter(contact => contact.includes(req.query.q))
        //                      .map(filteredContact => filteredContact.split('@')[0]);
        //   res.status(200).json({type: 'success', contacts});                          
        // }
        
      } else {
        res.status(200).json({type: 'success', message: 'No contacts were found.', contacts: []})
      }
    });
  }
);

//JWT check
//approve the request
router.put("/user/:to_email/approve",
passport.authenticate('jwt', { session: false }),
(req, res) => {
  invitationRejectApproveHelper(req,res,'approved');
});

//JWT check
//reject the request
router.put("/user/:to_email/reject",
passport.authenticate('jwt', { session: false }),
(req, res) => {
  invitationRejectApproveHelper(req,res,'rejected');
});

module.exports = router;
