import React from 'react';
import classNames from 'classnames';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import pink from '@material-ui/core/colors/pink';
import indigo from '@material-ui/core/colors/indigo';
import amber from '@material-ui/core/colors/amber';
import teal from '@material-ui/core/colors/teal';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';

import './style.css';
import {getPrettyTime} from '../../util/helpers';
import {useAuth} from '../../context/auth-context';

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

const Message = props => {
  const {message, userEmail, messageTime, ref, color} = props;
  const {user} = useAuth();
  const {language} = user;
  const classes = useStyles();

  var msgClass = classNames({
    messageBubble: true,
    'messageBubbleFriend': !props.isAuthorUser,
    'messageBubbleUser': props.isAuthorUser
  });

  const getUserInitial = () => {
    if (userEmail && userEmail.length) {
      return userEmail[0].toUpperCase();
    }
    return '';
  }

  if (!props.isAuthorUser) {
    let translation;
    //cases
    //1 friend language is same as author language
    //3 friend language is different (original language toggle on)
    if (language === message.language || props.showMsgInOriginalLanguage) {
      translation = message.original_message;
    } else if (language !== message.language && !props.showMsgInOriginalLanguage) {
    //2 friend language is different from author language (original language toggle off)
      translation = message.translations[language];
    }
    return (
      <div ref={ref} style={{display: 'flex', flexFlow: 'row nowrap', justifyContent: 'flex-start', alignItems: 'flex-start', margin: '18px 0'}}>
        <Avatar className={classes[color]}>{getUserInitial()}</Avatar>
        <div style={{display: 'flex', flexFlow: 'column nowrap', marginLeft: '8px'}}>
          <Typography variant='body1' className="messageAuthorTime">{userEmail} {getPrettyTime(messageTime)}</Typography>
          <div className={msgClass}>{translation}</div>
        </div>
      </div>
    )  
  } else {
    return (
      <div ref={ref} style={{display: 'flex', flexFlow: 'row nowrap', justifyContent: 'flex-end', alignItems: 'flex-end', margin: '18px 0'}}>
        <div style={{display: 'flex', flexFlow: 'column nowrap', marginLeft: '8px', alignItems: 'flex-end'}}>
          <Typography variant='body1' className="messageAuthorTime">{getPrettyTime(messageTime)}</Typography>
          <div className={msgClass}>{props.message.original_message}</div>
        </div>
      </div>
    )  
  }

};

export default Message;