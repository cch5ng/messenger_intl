import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
import pink from '@material-ui/core/colors/pink';
import indigo from '@material-ui/core/colors/indigo';
import amber from '@material-ui/core/colors/amber';
import teal from '@material-ui/core/colors/teal';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';

import {useAuth} from '../../../context/auth-context';
import './style.css';

const avatarColors = [
  'pink',
  'indigo',
  'amber',
  'teal',
  'red',
  'green'
]

const useStyles = makeStyles((theme) => ({
  pink: {
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: pink[500],
  },
  indigo: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: indigo[500],
  },
  amber: {
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: amber[500],
  },
  teal: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: teal[500],
  },
  red: {
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: red[500],
  },
  green: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: green[500],
  },
}));


const ChatSummaryItem = (props) => {
  const {conversation, idx, handleChatClick, color} = props;
  const {user} = useAuth();
  const classes = useStyles();
  console.log('color', color)
  //let color = null//avatarColors[idx % 6];

  let lastMessage = conversation.messages && conversation.messages.length ? conversation.messages[conversation.messages.length - 1] : '';

  const filterSelfEmail = (emailAr) => {
    let selfIdx = emailAr.indexOf(user.email);
    let copyUserEmails = emailAr.slice(0);
    copyUserEmails.splice(selfIdx, 1);
    return copyUserEmails;
  }

  const getLastMessageTranslated = () => {
    if (!lastMessage) return '';
    if (lastMessage && lastMessage.language === user.language) {
      return lastMessage.original_message;
    } else if (lastMessage && lastMessage.language !== user.language) {
      return lastMessage.translations[user.language];
    }
  }

  const getFriendInitial = () => {
    let friendEmails = filterSelfEmail(conversation.user_emails);
    if (friendEmails.length === 1) {
      return friendEmails[0][0].toUpperCase();
    } else {
      return '';
    }
  }

  return (
    <div className="chat_summary_item_container"
      onClick={(ev) => handleChatClick(conversation._id.toString())}>
      {!color && (
        <Avatar>{getFriendInitial()}</Avatar>
      )}
      {color && (
        <Avatar className={classes[color]}>{getFriendInitial()}</Avatar>
      )}
      <div className="chat_summary_detail_container">
        <div className="friends_name_text">
          {filterSelfEmail(conversation.user_emails).join(', ')}
        </div>
        <div className="message_text">{getLastMessageTranslated()}</div>
      </div>
    </div>
  )
}

export default ChatSummaryItem;