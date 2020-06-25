const mongoose = require("mongoose");
const Conversation = require("../models/conversation");

const saveMessageToConversation = ({message, updated_on, conversationId}) => {
  const id = mongoose.Types.ObjectId(conversationId);
  Conversation.updateOne({_id: id},
                {
                  $push: {
                    messages: message
                  },
                  updated_on
                }, function(err, chat) {
                  if (err) return console.error('Could not save post', err);
                  if (chat) console.log('Conversation was updated');
                })
}

const getUniquePairsFromGroup = (emails) => {
  if (emails.length <=2 ) {
    return [emails];
  }
  let emailPairs = [];
  for (let i = 0; i < emails.length - 1; i++) {
    for (let j = i + 1; j < emails.length; j++) {
      let pair = [emails[i], emails[j]];
      emailPairs.push(pair);
    }
  }
  return emailPairs;
}

//@param [string]
const buildQueryIsPairFriends = (emails) => {
  let query = {};
  let queryAr = [];
  let queryObj1 = {};
  let queryObj2 = {};
  queryObj1.to_user_email = emails[0];
  queryObj1.from_user_email = emails[1];
  queryAr.push(queryObj1);
  queryObj2.to_user_email = emails[1];
  queryObj2.from_user_email = emails[0];
  queryAr.push(queryObj2);
  query['$or'] = queryAr;
  query.approved = true;
  return query;
}

module.exports = {saveMessageToConversation, getUniquePairsFromGroup, buildQueryIsPairFriends};