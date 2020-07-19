import React, {useEffect, useState} from 'react';
import { useParams, Link, useHistory } from "react-router-dom";
import io from 'socket.io-client';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import ChatHeader from './ChatHeader';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';
import {useAuth} from '../../context/auth-context';
import {useSocket} from '../../context/socket-context';
import {getEmailAr, isEmailValid} from '../../util/helpers';
import styles from './Chat.module.css';

const MAX_MESSAGE_LENGTHS = {
  'english': 200,
  'french': 200,
  'spanish': 200,
  'mandarin': 66,
  'hindi': 66
};

let socket;

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Chat = props => {
  let { conversationId } = useParams();
  const {chatType} = props;
  const {user, emailToLangDict, logout} = useAuth();
  const {language} = user;
  const userEmail = user.email;
  const {addConversation, addMessageToConversation, initConversationsDict, getConversationById,
    setAllConversationMessages, conversationsAr, conversationsDict, updateCurConversation, 
    getColorForConversationId, curConversation} = useSocket();
  let history = useHistory();

  const [toEmailAddresses, setToEmailAddresses] = useState('');
  const [toEmailAddressesError, setToEmailAddressesError] = useState('');
  const [curMessage, setCurMessage] = useState('');
  const [chatUserEmails, setChatUserEmails] = useState([]);
  const [messageInputError, setMessageInputError] = useState('');
  const [languageError, setLanguageError] = useState('');
  const [showMsgInOriginalLanguage, setShowMsgInOriginalLanguage] = useState(false);
  const [submitGroupConversationError, setSubmitGroupConversationError] = useState('');
  let curMessages = curConversation && curConversation.messages ? curConversation.messages : [];

  if(socket && conversationId) {
    socket.on(conversationId, (data) => {
      addMessageToConversation({conversationId, message: data['message']});
    });
  }

  const sendChatMessage = ({from_email, message, conversationId, userEmails, friendLanguages, action}) => {
    socket.send({message, conversationId, userEmails, friendLanguages, action});
    addMessageToConversation({conversationId, message});
  }

  const sendGroupChatInitMessage = ({from_email, message, conversationId, user_emails, action, created_on, updated_on}) => {
    socket.send({message, conversationId, user_emails, action, from_email, created_on, updated_on});
    let conversation = {messages: [message], _id: conversationId, user_emails,
      created_on, updated_on};
  }

  const closeAlertHandler = () => {
    setSubmitGroupConversationError('');
  }

  const handleLanguageToggle = () => {
    setShowMsgInOriginalLanguage(!showMsgInOriginalLanguage);
  }

  const emailInpChangeHandler = ev => {
    let {value} = ev.target;
    if (value.length === 0) {
      setToEmailAddressesError('');
    }
    setToEmailAddresses(value);
  }

  const messageInputOnChangeHandler = ev => {
    let {value} = ev.target;
    let maxLength = MAX_MESSAGE_LENGTHS[language];
    if (value.length <= maxLength) {
      setCurMessage(value);
      setMessageInputError('');
    } else {
      setCurMessage(value.slice(0, maxLength))
      let error = `The max message length is ${maxLength}.`;
      setMessageInputError(error);
    }
  };

  const newMessageInputSubmitHandler = ev => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      setToEmailAddressesError('');
      let emailsAr = getEmailAr(toEmailAddresses);
      if (areRecipientsFriends(emailsAr)) {
        emailsAr.push(userEmail);
        emailsAr = emailsAr.filter(em => isEmailValid(em));
        let message = {
          author_id: user.id,
          author_email: user.email,
          original_message: curMessage,
          language,
          created_on: Date.now(),
          translations: {}
        };
        let friendLanguages = getFriendLanguages();
        if (friendLanguages.length) {
          //3 make post request for new conversation (get back id)
          let jwtToken = localStorage.getItem('authToken');
          let body = { emailsAr, message, friendLanguages };
          fetch('/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(body)
          })
            .then(resp => resp.json())
            .then(json => {
              if (json.type === 'error') {
                //TODO activate snackbar
                console.log('error on group convo init')
                setSubmitGroupConversationError(json.message);
              } else if (json.conversationId) {
                setToEmailAddresses('');
                setCurMessage('');
                if (json.type === 'success' && json.message === 'A new conversation was created') {
                    let conversation = {
                      _id: json.conversationId, 
                      messages: [json.conversation_message],
                      user_emails: emailsAr,
                      created_on: json.created_on,
                      updated_on: json.updated_on
                    }
                    sendGroupChatInitMessage({from_email: userEmail,
                      action: 'group conversation init',
                      message: json.conversation_message,
                      conversationId: json.conversationId,
                      user_emails: emailsAr,
                      created_on: json.created_on,
                      updated_on: json.updated_on
                    });
                    addConversation(conversation, json.conversationId);              
                    history.push(`/conversations/${json.conversationId}`);  
                  }
              }
            })
            .catch(err => console.error('error with group convo', err))
        }
      } else {
        setToEmailAddressesError('The chat cannot be started because email addresses are invalid or recipients are not friends. Please check email addresses or invite people to become friends.')
      }
    }
  }

  const messageInputSubmitHandler = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      let message = {
        author_id: user.id,
        author_email: user.email,
        original_message: curMessage,
        language,
        created_on: Date.now(),
        translations: {}
      };
      let conversation = getConversationById(conversationId);
      sendChatMessage({
        from_email: user.email,
        message,
        conversationId,
        userEmails: curConversation.user_emails,
        friendLanguages: getFriendLanguages(),
        action: 'message'
      });
      addMessageToConversation({conversationId, message});
      setCurMessage('');
      setMessageInputError('');
    }
  }

  const getFriendLanguages = () => {
    let friendEmails =  chatType === 'new' ? getEmailAr(toEmailAddresses): getFriendEmail();
    let friendLanguages = [];
    friendEmails.forEach(email => {
      if (!emailToLangDict[email]) {
        return [];
      }
      let lang = emailToLangDict[email]['language'];
      if (friendLanguages.indexOf(lang) === -1 && lang !== language) {
        friendLanguages.push(lang);
      }
    });
    return friendLanguages;
  }

  const getFriendEmail = () => {
    if (curConversation && curConversation.user_emails) {
      let friendEmails = curConversation.user_emails.filter(email => email !== user.email);
      return friendEmails;  
    } else if (conversationId) {
      curConversation = getConversationById(conversationId);
      if (curConversation.user_emails) {
        let friendEmails = curConversation.user_emails.filter(email => email !== user.email);
        return friendEmails;  
      }
    }
    return [];
  }

  const switchTranslations = isChecked => {
    setShowMsgInOriginalLanguage(isChecked);
  }

  //validation for group conversation init; make sure that message recipients are already friends
  const areRecipientsFriends = (emailsAr) => {
    if (Object.keys(emailToLangDict).length) {
      let currentContacts = Object.keys(emailToLangDict);
      for (let i = 0; i < emailsAr.length; i++) {
        if (currentContacts.indexOf(emailsAr[i]) === -1) {
          return false;
        }
      }
      return true;  
    }
    return false;
  }

  useEffect(() => {
    if (conversationId) {
      socket.on('connect', function(){
        socket.emit('room', conversationId);
      });
    }
    if (process.env.NODE_ENV === 'development') {
      socket = io.connect(`http://localhost:3001/chat`);
    } else if (process.env.NODE_ENV === 'production') {
      let options = { secure: true,
                      reconnect: true,
                      rejectUnauthorized : false
      };
      socket = io.connect(`https://messenger-intl.herokuapp.com:443/chat`, options);
    }
  }, [])

  useEffect(() => {
    let jwtToken = localStorage.getItem('authToken');
    if (conversationId && jwtToken) {
      fetch(`/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        }
      })
        .then(resp => {
          if (resp.status === 401) {
            logout();
          } else {
            return resp.json();
          }
        })
        .then(json => {
          if (json && json.type === 'success') {
            updateCurConversation(json.conversation);
          }
        })
        .catch(err => console.error('Could not find existing conversation.', err))
    } else if (!jwtToken) {
      logout();
    }

  }, [conversationId]);
  
  if (chatType === 'new') {
    return (
      <div className={styles.chatContainer}>
        <ChatHeader 
          switchTranslations={switchTranslations}
          friendEmails={[]}
        />
        <main>
          <div className={styles.spacer}>
            <form noValidate autoComplete="off" >
              <TextField
                id="inp_to_emails"
                value={toEmailAddresses}
                placeholder="To: email addresses (separated by comma)"
                variant="outlined"
                onChange={emailInpChangeHandler}
                error={toEmailAddressesError.length}
                helperText={toEmailAddressesError.length ? toEmailAddressesError: ''}
                fullWidth
              />
            </form>
          </div>
          <div className={styles.spacer} />
          <MessageInput
            userEmail={user}
            messageInputOnChangeHandler={messageInputOnChangeHandler}
            messageInputSubmitHandler={newMessageInputSubmitHandler}
            curMessage={curMessage}
            error={messageInputError}
          />
          <Snackbar open={submitGroupConversationError.length !== 0} autoHideDuration={5000} onClose={ closeAlertHandler }>
            <Alert onClose={closeAlertHandler} severity="error">
              {submitGroupConversationError}
            </Alert>
          </Snackbar>
        </main>
      </div>
    )
  }

  if (chatType === 'empty') {
    return (
      <div className={styles.chatContainer}>
        <ChatHeader 
          switchTranslations={switchTranslations}
          friendEmails={[]}
        />
        <main className={styles.spacer}>
          <Typography variant='p1'>No conversations have been started yet. Click on a contact to start chatting.</Typography>
        </main>
      </div>
    )
  }

  if (chatType === 'existing') {
    curMessages = curConversation && curConversation.messages ? curConversation.messages : [];
    let friendEmails = [];
    if (curConversation && curConversation.user_emails) {
      friendEmails = curConversation.user_emails.filter(email => email !== userEmail)
    }
    let color = getColorForConversationId(conversationId);

    return (
      <div className={styles.chatContainer}>
        <ChatHeader 
          handleLanguageToggle = {handleLanguageToggle}
          showMsgInOriginalLanguage = {showMsgInOriginalLanguage}
          friendEmails={friendEmails}
          color={color}
        />
        <main>
          <MessageDisplay
            showMsgInOriginalLanguage = {showMsgInOriginalLanguage}
            userEmail={user.email} 
            messages={curMessages}
            color={color}
          />
          <MessageInput
            userEmail={user}
            messageInputOnChangeHandler={messageInputOnChangeHandler}
            messageInputSubmitHandler={messageInputSubmitHandler}
            curMessage={curMessage}
            error={messageInputError}
          />
        </main>
      </div>
    )
  }
}

export default Chat;
