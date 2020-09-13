import React, {useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import io from 'socket.io-client';
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';

import {useAuth} from '../../../context/auth-context';
import {useSocket} from '../../../context/socket-context';
import ChatSummaryItem from './ChatSummaryItem';
import styles from './ChatSummary.module.css';

let socket;

const ChatSummary = () => {
  let history = useHistory();
  const [conversationList, setConversationList] = useState([]);
  const {user, logout} = useAuth();
  const {conversationsAr, initConversationsAr, addConversation, getColorForConversationId} = useSocket();

  if(socket && user) {
    socket.on(user.id, (data) => {
      if (typeof data.conversation.created_on === 'number') {
        let created_on_date = new Date(data.conversation.created_on);
        data.conversation.created_on = created_on_date.toISOString();
      }
      if (typeof data.conversation.updated_on === 'number') {
        let updated_on_date = new Date(data.conversation.updated_on);
        data.conversation.updated_on = updated_on_date.toISOString();
      }
      addConversation(data.conversation, data.conversation._id);
    });
  }

  const clickIconHandler = () => {
    history.push('/conversations/new');
  }

  const handleChatClick = (conversationId) => {
    history.push(`/conversations/${conversationId}`);
  }

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      socket = io.connect(`http://localhost:3001/chat`);
    } else if (process.env.NODE_ENV === 'production') {
      let options = { secure: true,
        reconnect: true,
        rejectUnauthorized : false
      };
      socket = io.connect(`https://messenger-intl.herokuapp.com:443/chat`, options);
    }

    let jwtToken = localStorage.getItem('authToken');
    if (jwtToken) {
      fetch(`/conversations/user/${user.email}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
      })
        .then(resp => {
          if (resp.status === 401) {
            logout();
            return;
          }
          return resp.json();
        })
        .then(json => {
          if (json && json.conversations.length) {
            initConversationsAr(json.conversations, user.email);
            let conversationId = json.conversations[0]._id.toString();
            history.push(`/conversations/${conversationId}`);
          }
        })
        .catch(err => console.error('get convos summary err', err))
    }
  }, []);

  return (
    <div className={styles.chat_summary_container}>
      <CreateOutlinedIcon onClick={clickIconHandler} />
      <div>
        {conversationsAr.map((convo, idx) => {
          return (
            <ChatSummaryItem conversation={convo} idx={idx} handleChatClick={handleChatClick} 
              color={getColorForConversationId(convo._id)} />
          )
        })}
        {conversationsAr.length === 0 && (
          <p>No conversations were found.</p>
        )}
      </div>
    </div>
  )
}

export default ChatSummary;