import React, {useEffect, useState} from 'react';
//import io from 'socket.io-client';

const avatarColors = [
  'pink',
  'indigo',
  'amber',
  'teal',
  'red',
  'green'
];

const SocketContext = React.createContext([{}, () => {}])

function SocketProvider({children}) {
  const [conversationsDict, setConversationsDict] = useState({});
  const [conversationsAr, setConversationsAr] = useState([]);
  const [curConversationId, setCurConversationId] = useState(null);
  const [curConversation, setCurConversation] = useState({});
  const [conversationsColorsDict, setConversationsColorsDict] = useState({});

  const initConversationsAr = (conversations) => {
    if (conversations.length) {
      setConversationsAr(conversations);
      initConversationsDict(conversations);  
    }
  }

  const initConversationsDict = (convoAr) => {
    if (convoAr.length) {
      let dict = {};
      convoAr.forEach(convo => {
        let id = convo._id.toString();
        dict[id] = convo;
      });
      setConversationsDict(dict);
    }
  }

  const addMessageToConversation = ({conversationId, message}) => {
    //update curConversation
    if (conversationId === curConversation._id) {
      setCurConversation({
        ...curConversation,
        updated_on: message.created_on,
        messages: curConversation.messages.concat([message])
      })
    }
    //update conversationsDict
    if (conversationsDict[conversationId]) {
      setConversationsDict({
        ...conversationsDict,
        [conversationId]: {
          ...conversationsDict[conversationId],
          updated_on: message.created_on,
          messages: conversationsDict[conversationId].messages.concat([message])
        }
      })
    } else {
      setConversationsDict({
        ...conversationsDict,
        [conversationId]: {
          _id: conversationId,
          created_on: message.created_on,
          updated_on: message.created_on,
          messages: [message]
        }
      })
    }
  }

  const setAllConversationMessages = ({conversationId, messages}) => {
    setConversationsDict({
      ...conversationsDict,
      [conversationId]: {
        ...conversationsDict[conversationId],
        messages
      }
    })
  }
  
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
    if (conversationId) {
      if (!conversationsColorsDict[conversationId]) {
        let curConversationsLen = Object.keys(conversationsDict).length;
        let newColor = avatarColors[curConversationsLen % avatarColors.length];
        setConversationsColorsDict({
          ...conversationsColorsDict,
          [conversationId]: newColor
        });
      }
      setConversationsDict({
        ...conversationsDict,
        [conversationId]: conversation
      });
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

  const getColorForConversationId = (conversationId) => {
    return conversationsColorsDict[conversationId] ? conversationsColorsDict[conversationId] : null;
  }

  useEffect(() => {
    if (Object.keys(conversationsDict).length) {
      let convosAr = [];
      Object.keys(conversationsDict).forEach(id => {
        convosAr.push(conversationsDict[id]);
      })
      let orderedAr = [];
      convosAr.sort((a, b) => {
        let date_a = Date.parse(a.updated_on);
        let date_b = Date.parse(b.updated_on);
        return date_b - date_a;
      });
      setConversationsAr(convosAr);
      let colorsDict = {};
      if (Object.keys(conversationsColorsDict).length === 0) {
        convosAr.forEach((convo, idx) => {
          let id = convo._id;
          colorsDict[id] = avatarColors[idx % avatarColors.length];
        })
        console.log('colorsDict', colorsDict)
        setConversationsColorsDict(colorsDict);
      }  
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
    updateCurConversation,
    getColorForConversationId
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