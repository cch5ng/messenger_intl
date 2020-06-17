import React from 'react';

import {useAuth} from '../../../context/auth-context';
import './style.css';

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
    <div className="chat_summary_item_container">
      <p>avatar</p>
      <div className="chat_summary_detail_container">
        <div>{filterSelfEmail(conversation.user_emails)}</div>
        <div>{getLastMessageTranslated()}</div>
      </div>
    </div>
  )
}

export default ChatSummaryItem;