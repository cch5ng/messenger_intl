import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';

const SocketContext = React.createContext([{}, () => {}])
//const socket = io.connect('http://localhost:3001/chat');

function SocketProvider({children}) {
  const [conversationsDict, setConversationsDict] = useState({});
  const [conversationsAr, setConversationsAr] = useState([]);
  const [curConversationId, setCurConversationId] = useState(null);
  const [curConversation, setCurConversation] = useState({});
  const [conversationsColorsDict, setConversationsColorsDict] = useState({});

  //should happen once per session
  const initConversationsAr = (conversations) => {
    if (conversations.length) {
      setConversationsAr(conversations);
      initConversationsDict(conversations);  
    }
  }

  //TODO TEST
  //should happen once per session, on initConversationsAr
  const initConversationsDict = (convoAr) => {
    if (convoAr.length) {
      let dict = {};
      convoAr.forEach(convo => {
        let id = convo._id.toString();
        dict[id] = convo;
      });
      console.log('dict', dict)
      setConversationsDict(dict);
    }
  }

  //TODO TEST
  const addMessageToConversation = ({conversationId, message}) => {
    console.log('conversationsDict', conversationsDict)
    console.log('curConversation', curConversation)
    console.log('conversationId', conversationId)

    //update curConversation
    if (conversationId === curConversation._id) {
      setCurConversation({
        ...curConversation,
        messages: curConversation.messages.concat([message])
      })
    }

    //update conversationsDict
    if (conversationsDict[conversationId]) {
      setConversationsDict({
        ...conversationsDict,
        [conversationId]: {
          ...conversationsDict[conversationId],
          messages: conversationsDict[conversationId].messages.concat([message])
        }
      })
    } else {
      setConversationsDict({
        ...conversationsDict,
        [conversationId]: {
          _id: conversationId,
          created_on: Date.now(),
          updated_on: Date.now(),
          messages: [message]
        }
      })
    }
  }

  // const setConversationsDict = ({
  //     ...conversationsDict,
  //     [conversationId]: {
  //       ...conversationsDict[conversationId],
  //       messages: conversationsDict[conversationId]['messages'].concat([message])
  //     }
  //   })
  // }

  const setAllConversationMessages = ({conversationId, messages}) => {
    setConversationsDict({
      ...conversationsDict,
      [conversationId]: {
        ...conversationsDict[conversationId],
        messages
      }
    })
  }
  
  // const sendChatMessage = ({socket, from_email, message, conversationId, userEmails, friendLanguages, action}) => {
  //   socket.send({message, conversationId, userEmails, friendLanguages, action});
  // }

  // const sendGroupChatInitMessage = ({socket, from_email, message, conversationId, userEmails, action}) => {
  //   socket.send({message, conversationId, userEmails, action});
  // }

  const getConversationById = (id) => {
    if (conversationsDict[id]) {
      return conversationsDict[id];
    }
    return {};
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

  const addConversation = (conversation, conversationId) => {
    conversation.created_on = Date.now();
    conversation.updated_on = Date.now();
    if (!conversationsDict[conversationId]) {
      setConversationsDict({
        ...conversationsDict,
        [conversationId]: conversation
      })
    }
  }

  const updateCurConversation = (conversation) => {
    setCurConversation(conversation);
    let id = conversation._id;
    setConversationsDict({
      ...conversationsDict,
      [id]: {
        ...conversationsDict[id],
        ...conversation
      }
    })
  }

  //TODO and TEST
  useEffect(() => {
    if (Object.keys(conversationsDict).length) {
      let convosAr = [];
      Object.keys(conversationsDict).forEach(id => {
        convosAr.push(conversationsDict[id]);
      })
      let orderedAr = [];
      convosAr.sort((a, b) => {
        return a.updated_on - b.updated_on;
      });
      setConversationsAr(convosAr);      
    }
  }, [conversationsDict]);

  const socketShare = {
    conversationsAr,
    conversationsDict,
    curConversation,
    addMessageToConversation, 
    initConversationsAr,
    initConversationsDict,
    curConversationId,
    addConversationColor,
    getConversationColorById,
    addConversation,
    getConversationById,
    setAllConversationMessages,
    updateCurConversation
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