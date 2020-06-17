import React, {useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';

import {useAuth} from '../../../context/auth-context';
import ChatSummaryItem from './ChatSummaryItem';

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
          console.log('json', json)
          setConversationList(json.conversations);
          let conversationId = json.conversations[0]._id.toString();
          history.push(`/conversations/${conversationId}`);
        }
      })
      .catch(err => console.error('get convos summary err', err))
  }, []);

  return (
    <div>
      <CreateOutlinedIcon onClick={clickIconHandler} />
      {conversationList.map(convo => {
        return (
          <ChatSummaryItem conversation={convo} />
        )
      })}
      {conversationList.length === 0 && (
        <p>No conversations were found.</p>
      )}
    </div>
  )
}

export default ChatSummary;