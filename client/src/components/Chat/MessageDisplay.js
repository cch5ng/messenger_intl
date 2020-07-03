import React, {useEffect, useState} from 'react';
import Grid from '@material-ui/core/Grid';

import Message from './Message';
import {useAuth} from '../../context/auth-context';

const MessageDisplay = props => {
  const {user} = useAuth();
  const {messages} = props;
  const [messagesEnd, setMessagesEnd] = useState(null);

  const scrollToBottom = () => {
    messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    if (messagesEnd) {
      scrollToBottom();
    }
  }, [messagesEnd, messages]);

  const messageList = messages.map((msg, idx) => (
    <Message
      showMsgInOriginalLanguage = {props.showMsgInOriginalLanguage}
      message={msg}
      messageTime={msg.created_on}
      userEmail={msg.author_email}
      key={`${idx}-${msg}`}
      isAuthorUser={msg.author_email === user.email}
    />
  ))

  return (
    <div
      style={{backgroundColor: '#fff', padding: '18px', 
      flexGrow: '1', overflowY: 'auto', 
    }}>
      {messageList}
      <div style={{ float:"left", clear: "both" }}
        ref={(el) => { setMessagesEnd(el) }}>
      </div>
    </div>
)};

export default MessageDisplay;