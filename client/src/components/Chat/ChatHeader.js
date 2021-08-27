import React, {Fragment} from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
import pink from '@material-ui/core/colors/pink';
import indigo from '@material-ui/core/colors/indigo';
import amber from '@material-ui/core/colors/amber';
import teal from '@material-ui/core/colors/teal';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';

import styles from './Chat.module.css';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  orange: {
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: deepOrange[500],
  },
  purple: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
  },
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
  chatHeaderName: {
    padding: '0 5px',
  },
}));

const AntSwitch = withStyles((theme) => ({
  root: {
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex',
  },
  switchBase: {
    padding: 2,
    color: theme.palette.grey[500],
    '&$checked': {
      transform: 'translateX(12px)',
      color: theme.palette.common.white,
      '& + $track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      },
    },
  },
  thumb: {
    width: 12,
    height: 12,
    boxShadow: 'none',
  },
  track: {
    border: `1px solid ${theme.palette.grey[500]}`,
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: theme.palette.common.white,
  },
  checked: {},
}))(Switch);

const ChatHeader = props => {
  let friendEmails = props && props.friendEmails.length ? props.friendEmails : [];
  let {color} = props;
  const classes = useStyles();

  let initial = friendEmails && friendEmails.length === 1 ? friendEmails[0][0].toUpperCase() : '';
  
  if (process.env.REACT_APP_FF_CLIENT_MESSAGE_TRANSLATION === 'false') {
    return (
      <header className={styles.chatHeaderContainer} aria-label="Chat Header">
        <div className={styles.chatHeaderSpacer} />
      </header>
    );
  }

  if (!friendEmails.length) {
    return (
      <header className={styles.chatHeaderContainer} aria-label="Chat Header">
        <div className={styles.chatHeaderSpacer} />
        <div className={styles.chatHeaderRight}>
          <Typography component="div">
            <Grid component="label" container alignItems="center" spacing={1}>
              <Grid item>Original Language</Grid>
              <Grid item>
                <AntSwitch checked={props.showMsgInOriginalLanguage} onChange={props.handleLanguageToggle} name="checkedC" />
              </Grid>
            </Grid>
          </Typography>
        </div>
      </header>
    )
  }

  return (
    <header className={styles.chatHeaderContainer} aria-label="Chat Header">
      <div className={styles.chatHeaderLeft}>
        {friendEmails.length === 1 && (
          <Fragment>
            {color && (
              <Avatar className={classes[color]}>{initial}</Avatar>
            )}
            {!color && (
              <Avatar>{initial}</Avatar>
            )}
            <Typography className={classes.chatHeaderName} component="h1" variant="h5">
              {friendEmails[0].split('@')[0]}
            </Typography>
          </Fragment>
        )}
        {friendEmails.length > 1 && (
          <Typography className={classes.chatHeaderName} component="h1" variant="h5">
            Group Conversation ({friendEmails.length})
          </Typography>
        )}
      </div>
      <div className={styles.chatHeaderSpacer} />
      <div className={styles.chatHeaderRight}>
        <Typography component="div">
          <Grid component="label" container alignItems="center" spacing={1}>
            <Grid item>Original Language</Grid>
            <Grid item>
              <AntSwitch checked={props.showMsgInOriginalLanguage} onChange={props.handleLanguageToggle} name="checkedC" />
            </Grid>
          </Grid>
        </Typography>
      </div>
    </header>
  );
}

export default ChatHeader;