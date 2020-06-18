import React, {useEffect, useState} from 'react';
import { useParams, Link, useHistory } from "react-router-dom";
import io from 'socket.io-client';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

import ChatHeader from './ChatHeader';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';
import {useAuth} from '../../context/auth-context';
import {getEmailAr, isEmailValid} from '../../util/helpers';

const MAX_MESSAGE_LENGTHS = {
  'english': 200,
  'french': 200,
  'spanish': 200,
  'mandarin': 66,
  'hindi': 66
};

let socket;

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      //margin: theme.spacing(1),
    },
  },
}));

const Chat = props => {
  let { conversationId } = useParams();
  const {chatType} = props;
  const {user, emailToLangDict} = useAuth();
  console.log('emailToLangDict', emailToLangDict)
  const {language} = user;
  const userEmail = user.email;
  const classes = useStyles();
  let history = useHistory();

  const [toEmailAddresses, setToEmailAddresses] = useState('');
  const [curMessage, setCurMessage] = useState('');
  const [postedMessages, setPostedMessages] = useState([]);
  const [chatUserEmails, setChatUserEmails] = useState([]);
  const [messageInputError, setMessageInputError] = useState('');
  const [friendLanguage, setFriendLanguage] = useState('');
  const [languageError, setLanguageError] = useState('');
  const [showMsgInOriginalLanguage, setShowMsgInOriginalLanguage] = useState(false);

  //socket listener for incoming messages
  if (socket && conversationId) {
    socket.on(conversationId, (data) => {
      setPostedMessages(postedMessages.concat([data.message]));
    });
  }

  const sendChatMessage = ({from_email, message, conversationId, userEmails, friendLanguage}) => {
    if (socket) {
      socket.send({message, conversationId, userEmails, friendLanguage});
    }
  }

  const handleLanguageToggle = () => {
    setShowMsgInOriginalLanguage(!showMsgInOriginalLanguage);
  }

  const emailInpChangeHandler = ev => {
    let {value} = ev.target;
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
      let emailsAr = getEmailAr(toEmailAddresses);
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
      //3 make post request for new conversation (get back id)
        //TODO BE should also translate the first message to friend languages
      let jwtToken = localStorage.getItem('authToken');
      let body = { emailsAr, message };
      fetch('http://localhost:3001/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${jwtToken}`
        },
        body: JSON.stringify(body)
      })
        .then(resp => resp.json())
        .then(json => {
          if (json.conversationId) {
            setToEmailAddresses('');
            setCurMessage('');
        //5 somehow indicate to contacts that new group conversation is available
            history.push(`/conversations/${json.conversationId}`);
          }
        })
        .catch(err => console.error('error with group convo', err))
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
      sendChatMessage({from_email: user.email,
        message,
        conversationId,
        userEmails: chatUserEmails,
        friendLanguage
      });
      setPostedMessages(postedMessages.concat([message]));
      setCurMessage('');
      setMessageInputError('');
    }
  }

  const getFriendEmail = () => {
    let friend = chatUserEmails.filter(email => email !== user.email);
    return friend;
  }

  const switchTranslations = isChecked => {
    setShowMsgInOriginalLanguage(isChecked);
  }

  useEffect(() => {
    //connect to socket
    socket = io.connect('http://localhost:3001/chat');
    if (conversationId) {
      socket.on('connect', function(){
        //maybe this should include conversationId + user email
        socket.emit('room', conversationId);
      });
    }
  }, [])

  useEffect(() => {
    setPostedMessages([]);
    let jwtToken = localStorage.getItem('authToken');
    if (conversationId) {
      fetch(`http://localhost:3001/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${jwtToken}`
        }
      })
        .then(resp => resp.json())
        .then(json => {
          if (json.messages && json.messages.length) {
            setPostedMessages(json.messages);
          }
          if (json.user_emails && json.user_emails.length) {
            setChatUserEmails(json.user_emails);
            //make api call to get friend language by email
            let friendEmail = json.user_emails[0] === userEmail ? json.user_emails[1]: json.user_emails[0];
            fetch(`http://localhost:3001/user/${friendEmail}/language`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwtToken}`
              }
            })
            .then(resp => resp.json())
            .then(json => {
              if (json.language) {
                setFriendLanguage(json.language);
              } else {
                setLanguageError(`Could not get the friend's language. Chat translations may not work.`)
              }
            })
            .catch(err => console.error('Could not get language.', err))
          }
        })
        .catch(err => console.error('Could not find existing conversation.', err))
    }
  }, [conversationId]);

  //TODO handle chatType = 'new', 'existing', 'empty'
  if (chatType === 'new') {
    return (
      <div style={{display: 'flex', flexFlow: 'column nowrap', justifyContent: 'space-between', height: '100vh'}}>
        <ChatHeader 
          switchTranslations={switchTranslations}
          friendEmails={[]}
        />
        <div className="spacer">
          <form className={classes.root} noValidate autoComplete="off" >
            <TextField
              id="inp_to_emails"
              label="To: (emails separated by comma)"
              value={toEmailAddresses}
              placeholder="To: email addresses"
              variant="outlined"
              onChange={emailInpChangeHandler}
              fullWidth
            />
          </form>
        </div>
        <div className="spacer" />
        <MessageInput
          userEmail={user}
          messageInputOnChangeHandler={messageInputOnChangeHandler}
          messageInputSubmitHandler={newMessageInputSubmitHandler}
          curMessage={curMessage}
          error={messageInputError}
        />
      </div>
    )
  }

  if (chatType === 'empty') {
    return (
      <div style={{display: 'flex', flexFlow: 'column nowrap', justifyContent: 'space-between', height: '100vh'}}>
        <ChatHeader 
          switchTranslations={switchTranslations}
          friendEmails={[]}
        />
        <div className="spacer">
        <Typography variant='p1'>No conversations have been started yet. Click on a contact to start chatting.</Typography>
        </div>
      </div>
    )
  }

  if (chatType === 'existing') {
    return (
      <div style={{display: 'flex', flexFlow: 'column nowrap', justifyContent: 'space-between', height: '100vh'}}>
        <ChatHeader 
          handleLanguageToggle = {handleLanguageToggle}
          showMsgInOriginalLanguage = {showMsgInOriginalLanguage}
          friendEmails={getFriendEmail()}
        />
        <MessageDisplay
          showMsgInOriginalLanguage = {showMsgInOriginalLanguage}
          userEmail={user.email} 
          messages={postedMessages}
        />
        <MessageInput
          userEmail={user}
          messageInputOnChangeHandler={messageInputOnChangeHandler}
          messageInputSubmitHandler={messageInputSubmitHandler}
          curMessage={curMessage}
          error={messageInputError}
        />
      </div>
    )
  }
}

export default Chat;
