const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const Conversation = require("../models/conversation");
const User = require("../models/user");
const router = express.Router();

//post new conversation (given list of users) returning id
router.post("/",
  passport.authenticate('jwt', {session: false}),
  function(req, res, next) {
    const {emailsAr} = req.body;
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
      //else create converation, returning _id
        let newChat = message ?
          new Conversation({user_emails: emailsAr, messages: [message]}) :
          new Conversation({user_emails: emailsAr});
        newChat.save(function(err, conversation) {
          if (err) console.error('Conversation could not be created', err);
          if (conversation) {
            res.status(201).json({type: 'success', message: 'A new conversation was created', conversationId: conversation._id.toString()});
          } else {
            res.json({type: 'error', message: 'The conversation could not be created. Please try again.'})
          }
        })
      }
    })
  }
);

/*  gets conversations for a given user email
    on successful return, json includes this object, dictEmailToLang
    {email as string: language as string} for all conversation participants
    as well as the conversations
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
                  let dictEmailToLang = {};
                  conversations.forEach((conversation, idx) => {
                    conversation.messages = conversation.messages[conversation.messages.length - 1];
                    conversation.user_emails.forEach((em, idx2) => {
                      let innerIdx = idx2;
                      if (!dictEmailToLang[em]) {
                        User.find({email: em}, function(err, user) {
                          if (err) {
                            return handleError(err)
                          }
                          if (user && user.length) {
                            dictEmailToLang[em] = user[0].language;
                            if (idx === conversations.length - 1 && innerIdx === conversation.user_emails.length - 1) {
                              res.json({ type: "success", conversations, dictEmailToLang})
                            }
                          }
                        })
                      }
                    })
                  })
                } else {
                    res.json({ type: "success", conversations: [], message: "There are no current conversations"})
                }
            }
        )
    }
);

//gets a conversation by conversationId
router.get("/:conversation_id",
    //passport.authenticate('jwt', { session: false }),
    function(req, res, next) {
        const {conversation_id} = req.params;
        let id = mongoose.Types.ObjectId(conversation_id);
        Conversation.findOne({_id: id}, function(err, conversation) {
          if (err) console.error('Could not get conversation', err);
          if (conversation && conversation.messages && conversation.user_emails) {
            res.status(200).json({type: 'success',
              messages: conversation.messages,
              user_emails: conversation.user_emails,
              message: 'An existing conversation was found.'})
          } else {
            res.json({type: 'error', message: 'That conversation was not found'})
          }
        }) 
    }
)


module.exports = router;