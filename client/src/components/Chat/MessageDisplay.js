import React, {useEffect, useState} from 'react';
//import Grid from '@material-ui/core/Grid';

import Message from './Message';
import {useAuth} from '../../context/auth-context';
import styles from './Chat.module.css';

const MessageDisplay = props => {
  const {user} = useAuth();
  const {messages, color} = props;
  const [messagesEnd, setMessagesEnd] = useState(null);


  useEffect(() => {
    const scrollToBottom = () => {
      messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
  
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
      color={color}
    />
  ))

  return (
    <div className={styles.messageDisplayContainer}>
      {messageList}
      <div className={styles.messageListEnd} 
        ref={(el) => { setMessagesEnd(el) }}>
      </div>
    </div>
)};

export default MessageDisplay;