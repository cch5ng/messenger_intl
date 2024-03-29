import React from 'react';
import {useHistory} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import userPlaceholderImg from '../../../assets/user-placeholder.png';
import InvitationDialog from '../../Invitations/InvitationDialog';
import {useAuth} from '../../../context/auth-context';
import { makeStyles, Badge } from '@material-ui/core';

const useStyles = makeStyles({
  contactListItem : {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#D5D5D5'
    },
    marginLeft: '2rem'
  },
  emptyContactList: {
    marginLeft: '2rem',
    height: 75,
  },
  searchBar : {
    width: '85%',
    marginLeft: '1rem'
  },
  customBadge : {
    backgroundColor: '#DDDDDD'
  }
});

const Friends = props => {
  const {user, logout} = useAuth();
  let email = user.email;
  let history = useHistory();
  const classes = useStyles();
  const {friends} = props;

  const contactClickHandler = (contactEmail) => {
    let jwtToken = localStorage.getItem('authToken');
    let emailsAr = [contactEmail, email];
    let body = {emailsAr};

    if (jwtToken && emailsAr.length) {
      //call API to either create a conversation (or find existing) and get back conversation id
      fetch('/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(body)
      })
        .then(resp => {
          if (resp.status === 401) {
            logout();
            return;
          }
          return resp.json();
        })
        .then(json => {
          if (json.conversationId) {
            history.push(`/conversations/${json.conversationId}`);
          }
        })
        .catch(err => console.error(err));
    }
  }

  const entries = () => friends.map(curr => (
    <Grid
      item
      container
      spacing={2}
      key={curr}
      onClick={(ev) => contactClickHandler(curr)}
      className={classes.contactListItem}
    >
      <Grid item>
      <Badge 
          anchorOrigin={{ 
            vertical: 'bottom', 
            horizontal: 'right' 
          }}  
          badgeContent=" "
          classes = {{
            badge: classes.customBadge
          }}
          variant='dot'
          >
          <Avatar src={userPlaceholderImg} alt="" />
        </Badge>
      </Grid>
      <Grid item>       
        <Typography variant='h6'>{curr.split('@')[0]}</Typography>
      </Grid>
    </Grid>
  ));

  return (
    <Grid 
      container
      direction='column'
      spacing={2}
    >
      {/* <Grid item>
        <TextField id="filled-search" className= {classes.searchBar} placeholder="Search" type="search" variant="filled" margin="normal" onChange={searchContacts} border={0} InputProps={{ 
          startAdornment: (<InputAdornment position="start"><SearchIcon/></InputAdornment>),
          disableUnderline: true
        }}/>
      </Grid> */}
      <Grid item >
        <InvitationDialog loadPendingInvites={props.loadPendingInvites} />
      </Grid>
      {friends.length > 0 && (entries())}
      {friends.length === 0 && (    
        <Grid
          item
          container
          spacing={2}
          className={classes.emptyContactList}
        >
          <Typography variant='p1'>You dont have any contacts. Send invites to initiate a conversation</Typography>
        </Grid>
      )}
    </Grid>
  );
}

export default Friends;