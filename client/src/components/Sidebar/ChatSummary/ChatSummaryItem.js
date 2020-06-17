import React from 'react';

import {useAuth} from '../../../context/auth-context';

const ChatSummaryItem = (props) => {
  const {conversation} = props;
  const {user} = useAuth();

  let lastMessage = conversation.messages[0];

  const filterSelfEmail = (emailAr) => {
    let selfIdx = emailAr.indexOf(user.email);
    let copyUserEmails = emailAr.slice(0);
    copyUserEmails.splice(selfIdx, 1);
    return copyUserEmails.join(', ');
  }

  const getLastMessageTranslated = () => {
    if (lastMessage.language === user.language) {
      return lastMessage.original_message;
    } else {
      return lastMessage.translations[user.language];
    }
  }

  return (
    <div>
      <p>avatar</p>
      <p>{filterSelfEmail(conversation.user_emails)}</p>
      <p>{getLastMessageTranslated()}</p>
      <p>unread messages count</p>
    </div>
  )
}

export default ChatSummaryItem;