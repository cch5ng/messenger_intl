import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';

const SocketContext = React.createContext([{}, () => {}])
const socket = io.connect('http://localhost:3001/chat');

function SocketProvider({children}) {
  const [conversationsDict, setConversationsDict] = useState({});
  const [conversationsAr, setConversationsAr] = useState([]);
  const [curConversationId, setCurConversationId] = useState(null);
  const [conversationsColorsDict, setConversationsColorsDict] = useState({});

  //TODO
  const addMessageToConversation = ({conversationId, message}) => {

  }

  //should happen once per session, on initConversationsAr
  const initConversationsDict = () => {

  }

  //should happen once per session
  const initConversationsAr = (conversations) => {
    setConversationsAr(conversations);
  }

  const getConversationById = () => {

  }

  const setConversationId = (conversationId) => {
    setCurConversationId(conversationId);
  }

  const addConversationColor = ({conversationId, color}) => {
    setConversationsColorsDict({conversationsColorsDict, conversationId: color})
  }

  const getConversationColorById = ({conversationId}) => {
    if (conversationsColorsDict[conversationId]) {
      return conversationsColorsDict[conversationId];
    }
    return null;
  }

  const addConversation = ({conversation}) => {
    setConversationsAr([conversation].concat(conversationsAr));
  }

  const sendChatMessage = ({from_email, message, conversationId, userEmails, friendLanguages}) => {
    socket.send({message, conversationId, userEmails, friendLanguages});
  }

  const socketShare = {socket,
                      conversationsAr,
                      sendChatMessage,
                      addMessageToConversation, 
                      initConversationsAr,
                      curConversationId,
                      addConversationColor,
                      getConversationColorById,
                      addConversation
                    };

  return (
    <SocketContext.Provider value={socketShare}>
      {children}
    </SocketContext.Provider>
  )
}

function useSocket() {
  const context = React.useContext(SocketContext)
  if (context === undefined) {
    throw new Error(`useSocket must be used within a SocketProvider`)
  }
  return context;
}

export {SocketProvider, useSocket};