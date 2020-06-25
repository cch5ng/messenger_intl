import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';

const SocketContext = React.createContext([{}, () => {}])
const socket = io.connect('http://localhost:3001/chat');

function SocketProvider({children}) {
  const [conversationsDict, setConversationsDict] = useState({});
  const [conversationsAr, setConversationsAr] = useState([]);
  const [curConversationId, setCurConversationId] = useState(null);
  const [conversationsColorsDict, setConversationsColorsDict] = useState({});
  let conversationIdToArIdxDict = {}; //used to update the conversationsAr quickly on new messages

  //should happen once per session
  const initConversationsAr = (conversations) => {
    if (conversations.length) {
      setConversationsAr(conversations);
      conversations.forEach((convo, idx) => {
        let id = convo._idx.toString();
        conversationIdToArIdxDict[id] = idx;
        //TODO and TEST
        //setClientSocketListener(convo._idx);
      })
      console.log('conversationIdToArIdxDict', conversationIdToArIdxDict)
      //TODO verify timing of this, is setConversationsAr ever too slow to init the ConversationsDict?
      initConversationsDict(conversations);  
    }
  }

  //TODO TEST, verify the data format of data.message
  const setClientSocketListener = (conversationId) => {
    //socket listener for incoming messages
    socket.on(conversationId, (data) => {
      console.log('new incoming message', data)
      setConversationsDict({...conversationsDict,
        conversationId: {...conversationsDict[conversationId], 
          messages: conversationsDict[conversationId]['messages'].concat([data.message])
        }
      })
      //TODO update the conversationsAr with new dict data
    });
  }

  //TODO TEST
  //should happen once per session, on initConversationsAr
  const initConversationsDict = (convoAr) => {
    if (convoAr.length) {
      let dict = {};
      convoAr.forEach(convo => {
        //verify whether need to convert _id value toString
        let id = convo._id.toString();
        dict[id] = convo;
      });
      setConversationsDict(dict);
    }
  }

  //TODO TEST
  const addMessageToConversation = ({conversationId, message}) => {
    console.log('conversationsDict', conversationsDict)
    console.log('conversationId', conversationId)
    console.log('type conversationId', typeof conversationId)
    setConversationsDict({
      ...conversationsDict,
      [conversationId]: {
        ...conversationsDict[conversationId],
        messages: conversationsDict[conversationId]['messages'].concat([message])
      }
    })
  }
  
  const sendChatMessage = ({from_email, message, conversationId, userEmails, friendLanguages, action}) => {
    socket.send({message, conversationId, userEmails, friendLanguages, action});
  }

  const sendGroupChatInitMessage = ({from_email, message, conversationId, userEmails, action}) => {
    socket.send({message, conversationId, userEmails, action});
  }

  //TODO resolve data storage when user goes to /conversations/:conversationId, do I update the conversationsDict with BE resp?
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

  //TODO and TEST
  useEffect(() => {
    console.log('gets to socket context useEffect')
    //should update conversationsAr
    if (Object.keys(conversationsDict).length) {
      let newConversationsAr = [];
      console.log('conversationIdToArIdxDict', conversationIdToArIdxDict)
      Object.keys(conversationIdToArIdxDict).forEach(conversationId => {
        let arIdx = conversationIdToArIdxDict[conversationId];
        console.log('arIdx', arIdx)
        newConversationsAr[arIdx] = conversationsDict[conversationId];
      });
      console.log('newConversationsAr', newConversationsAr);
      setConversationsAr(newConversationsAr);      
    }
  }, [conversationsDict]);

  const socketShare = {socket,
                      conversationsAr,
                      sendChatMessage,
                      addMessageToConversation, 
                      initConversationsAr,
                      initConversationsDict,
                      curConversationId,
                      addConversationColor,
                      getConversationColorById,
                      addConversation,
                      sendGroupChatInitMessage
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