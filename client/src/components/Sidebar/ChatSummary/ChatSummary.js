import React, {useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';

import {useAuth} from '../../../context/auth-context';
import ChatSummaryItem from './ChatSummaryItem';
import './style.css';

const ChatSummary = () => {
  let history = useHistory();
  const [conversationList, setConversationList] = useState([]);
  const {user} = useAuth();

  const clickIconHandler = () => {
    console.log('clicked icon')
    history.push('/conversations/new');
  }

  useEffect(() => {
    let jwtToken = localStorage.getItem('authToken');
    fetch(`http://localhost:3001/conversations/user/${user.email}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${jwtToken}`
      },
    })
      .then(resp => resp.json())
      .then(json => {
        if (json && json.conversations.length) {
          setConversationList(json.conversations);
          let conversationId = json.conversations[0]._id.toString();
          history.push(`/conversations/${conversationId}`);
        }
      })
      .catch(err => console.error('get convos summary err', err))
  }, []);

  return (
    <div className="chat_summary_container">
      <CreateOutlinedIcon onClick={clickIconHandler} />
      <div className="scrollable">
        {conversationList.map(convo => {
          return (
            <ChatSummaryItem conversation={convo} />
          )
        })}
        {conversationList.length === 0 && (
          <p>No conversations were found.</p>
        )}

      </div>
    </div>
  )
}

export default ChatSummary;