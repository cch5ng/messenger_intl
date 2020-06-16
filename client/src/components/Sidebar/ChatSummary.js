import React, {useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';

import {useAuth} from '../../context/auth-context';

const ChatSummary = () => {
  let history = useHistory();
  const [conversationList, setConversationList] = useState([]);
  const {user} = useAuth();

  const clickIconHandler = () => {
    console.log('clicked icon')
    history.push('/conversations/new');
  }

  useEffect(() => {
    //TODO fetch current user's conversations, update state
  }, []);

  return (
    <div>
      <h1>TODO ChatSummary</h1>
      <CreateOutlinedIcon onClick={clickIconHandler} />

    </div>
  )
}

export default ChatSummary;