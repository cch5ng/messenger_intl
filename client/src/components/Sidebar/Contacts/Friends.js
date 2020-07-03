import React, {useState, useEffect} from 'react';
import {useHistory} from 'react-router-dom';
import axios from 'axios';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import userPlaceholderImg from '../../../assets/user-placeholder.png';
import InvitationDialog from '../../Invitations/InvitationDialog';
import SearchIcon from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';
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
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const {user, updateEmailToLangDict} = useAuth();
  let email = user.email;
  let history = useHistory();
  const classes = useStyles();

  const contactClickHandler = (contactEmail) => {
    let jwtToken = localStorage.getItem('authToken');
    let emailsAr = [contactEmail, user.email];
    console.log('emailsAr', emailsAr)
    let body = {emailsAr};

    if (jwtToken.length && emailsAr.length) {
      //call API to either create a conversation (or find existing) and get back conversation id
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
            history.push(`/conversations/${json.conversationId}`);
          }
        })
        .catch(err => console.error(err));
    }
  }

  const loadFriends = async(q='') => {
    if(email){
      let authToken = localStorage.getItem('authToken');
      const res = await axios.get(`http://localhost:3001/invitations/user/${email}/contacts?q=${q}`, {headers: { Authorization: authToken}});
      if(res.data.contacts.length !== 0){
        let {contacts} = res.data;
        let contactEmails = Object.keys(contacts);
        setFriends(contactEmails);
        updateEmailToLangDict(contacts);
      }
      else {
        //'You dont have any contacts. Send invites to initiate a conversation'
        setFriends([]);
        updateEmailToLangDict({});
      }
    }
  }

  const searchContacts = async(e) => {
    setSearchQuery(e.target.value);
    loadFriends(searchQuery);
  }

  useEffect(() => {
    loadFriends();
  }, [])

  // useEffect(() => {
  //   loadFriends(searchQuery);
  // },[searchQuery]);

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