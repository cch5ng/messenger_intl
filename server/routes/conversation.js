const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const Conversation = require("../models/conversation");
const Invitation = require("../models/invitation");
const User = require("../models/user");
const router = express.Router();

const {getTranslation} = require("../util/translate_helpers");
const {language_codes} = require("../util/languages");
const {getUniquePairsFromGroup, buildQueryIsPairFriends} = require ("../util/socket_db")

//post new conversation (given list of users) returning id
router.post("/",
  passport.authenticate('jwt', {session: false}),
  function(req, res, next) {
    const {emailsAr, friendLanguages} = req.body;
    const message = req.body.message ? req.body.message : null;
    Conversation.find({ 
      $and: [{
        user_emails: { $all: emailsAr }
      }, {
        user_emails: { $size: emailsAr.length}
      }]
    }, function(err, conversations) {
      if (err) console.error(err);
      if (conversations && conversations.length) {
        res.status(200).json({type: "success", conversationId: conversations[0]._id.toString(), message: "An existing conversation was found."});
      } else {
        //verify that all users are connected to one another
        let pairsToValidate = getUniquePairsFromGroup(emailsAr);
        Promise.all(pairsToValidate.map(emailPair => {
          let areFriendsQuery = buildQueryIsPairFriends(emailPair);
          return Invitation.find(areFriendsQuery, function(err, invitations) {
            if (err) console.error('Could not find invitations during duplicate invites check', err);
            if (invitations && invitations.length) {
              return invitations;
            }
          })
        }))
          .then(invitations => {
            //returned expected # of valid friend pairs
            let invitationsPopulated = invitations.filter(invite => invite.length)
            if (invitationsPopulated.length !== pairsToValidate.length) {
              return res.json({type: 'error', message: 'The conversation could not be created. All participants need to be friends.'})
            } else {
                let newChat;
                //case1 new conversation between 2 people, no message
                if (!message) {
                  newChat = new Conversation({user_emails: emailsAr});
                  newChat.save(function(err, conversation) {
                    if (err) console.error('Conversation could not be created', err);
                    if (conversation) {
                      res.status(201).json({type: 'success', message: 'A new conversation was created', conversationId: conversation._id.toString(), user_emails: emailsAr});
                    } else {
                      res.json({type: 'error', message: 'The conversation could not be created. Please try again.'})
                    }
                  })
                } else {
                  //case2 new conversation between >2 people, initial message (needs translation first)
                  let translations = {};
                  Promise.all(friendLanguages.map(lang => {
                    let target = language_codes[lang];
                    return getTranslation(message.original_message, target);
                  }))
                    .then(translated => {
                      translated.forEach((trans, idx) => {
                        translations[friendLanguages[idx]] = trans[0];
                      });
                      message.translations = translations;
                      newChat = new Conversation({user_emails: emailsAr, messages: [message]});
                      newChat.save(function(err, conversation) {
                        if (err) console.error('Conversation could not be created', err);
                        if (conversation) {
                          res.status(201).json({type: 'success', message: 'A new conversation was created', conversationId: conversation._id.toString(), user_emails: emailsAr, conversation_message: message});
                        } else {
                          res.json({type: 'error', message: 'The conversation could not be created. Please try again.'})
                        }
                      });
                    })
                    .catch(err => console.error('Translation err', err))
                }
            } 
          })
          .catch(err => console.error('Error with validate conversation friends are all connected', err))
      }
    })
  }
);

/*  gets conversations for a given user email
*/
router.get("/user/:email",
    passport.authenticate('jwt', { session: false }),
    function(req, res, next) {
        const {email} = req.params;
        let objId = mongoose.Types.ObjectId;
        Conversation.find({user_emails:{ "$in" : [email]} }, '_id user_emails created_on updated_on messages')
            .sort({updated_on: -1})
            .exec(function(err, conversations) {
                if (err) {
                    return handleError(err);
                }
                if (conversations && conversations.length) {
                  conversations.forEach(convo => {
                    let shortMessages = [convo.messages[convo.messages.length - 1]];
                    convo.messages = shortMessages;
                  })
                  res.json({ type: "success", conversations})
                } else {
                    res.json({ type: "success", conversations: [], message: "There are no current conversations"})
                }
            }
        )
    }
);

//gets a conversation by conversationId
router.get("/:conversation_id",
    passport.authenticate('jwt', { session: false }),
    function(req, res, next) {
        const {conversation_id} = req.params;
        let id = mongoose.Types.ObjectId(conversation_id);
        Conversation.findOne({_id: id}, function(err, conversation) {
          if (err) console.error('Could not get conversation', err);
          if (conversation && conversation.messages && conversation.user_emails) {
            res.status(200).json({type: 'success',
              conversation,
              message: 'An existing conversation was found.'})
          } else {
            res.json({type: 'error', message: 'That conversation was not found'})
          }
        }) 
    }
)

module.exports = router;