import React, {useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';

import {useAuth} from '../../../context/auth-context';
import {useSocket} from '../../../context/socket-context';
import ChatSummaryItem from './ChatSummaryItem';
import './style.css';

const ChatSummary = () => {
  let history = useHistory();
  const [conversationList, setConversationList] = useState([]);
  const {user} = useAuth();
  const {conversationsAr, initConversationsAr} = useSocket();

  const clickIconHandler = () => {
    history.push('/conversations/new');
  }

  const handleChatClick = (conversationId) => {
    history.push(`/conversations/${conversationId}`);
  }

  useEffect(() => {
    let jwtToken = localStorage.getItem('authToken');
    fetch(`http://localhost:3001/conversations/user/${user.email}`, {
      headers: {
        'Authorization': `${jwtToken}`,
        'Content-Type': 'application/json'
      },
    })
      .then(resp => resp.json())
      .then(json => {
        if (json && json.conversations.length) {
          console.log('gets to initConversationsAr')
          initConversationsAr(json.conversations);
          let conversationId = json.conversations[0]._id.toString();
          history.push(`/conversations/${conversationId}`);
        }
      })
      .catch(err => console.error('get convos summary err', err))
  }, []);

  return (
    <div className="chat_summary_container">
      <CreateOutlinedIcon onClick={clickIconHandler} />
      <div>
        {conversationsAr.map((convo, idx) => {
          return (
            <ChatSummaryItem conversation={convo} idx={idx} handleChatClick={handleChatClick} />
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