import React, {useState, useEffect} from 'react';

import {useAuth} from '../../context/auth-context';

const ChatSummary = () => {
  const [conversationList, setConversationList] = useState([]);
  const {user} = useAuth();

  useEffect(() => {
    //TODO fetch current user's conversations, update state
  }, []);

  return (
    <div>
      <h1>TODO ChatSummary</h1>
    </div>
  )
}

export default ChatSummary;