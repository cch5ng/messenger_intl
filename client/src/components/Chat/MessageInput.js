import React, { Component, useState } from 'react';
import Grid from "@material-ui/core/Grid";
import InputBase from '@material-ui/core/InputBase';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

import styles from './Chat.module.css';

const useStyles = makeStyles((theme) => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}));

const MessageInput = (props) => {
  const classes = useStyles();
  const {messageInputOnChangeHandler, messageInputSubmitHandler, curMessage, error} = props;

  return (
    <form className={styles.messageInputContainer} >
      <TextField name="msg"
        id="chat_message"
        label="Chat message"
        error={error.length}
        value={curMessage}
        onChange={messageInputOnChangeHandler}
        onKeyPress={messageInputSubmitHandler}
        placeholder="Type something"
        fullWidth 
        margin="normal"
        variant="filled"
        className={classes.textField}
        helperText={error}
      />
    </form>
  );
}

export default MessageInput;