import React, { useState, useEffect } from 'react';
import Contacts from './Contacts/Contacts';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ForumIcon from '@material-ui/icons/Forum';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import PersonPinIcon from '@material-ui/icons/PersonPin';
import axios from 'axios';

import SidebarHeader from './SidebarHeader';
import ChatSummary from './ChatSummary/ChatSummary';
import {useAuth} from '../../context/auth-context';
//import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    maxWidth: 500,
  },
  sidebarContainer : {
    '&:hover': {
      maxHeight: '85vh',
      overflowY: 'auto',
      overflowX: 'hidden'
    }
  }
}));

const Sidebar = props => {
  const email = localStorage.getItem('email');
  const authToken = localStorage.getItem('authToken');
  const [friends, setFriends] = useState([]);
  const [approveInvite, setApproveInvite] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [value, setValue] = useState(0);
  const classes = useStyles();
  const {updateEmailToLangDict} = useAuth();

  //tab click handler
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function closeAlertHandler() {
    setApproveInvite('');
  }

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const updateContact = async(fromEmail, action) => {
    if(action === 'approve') {
      const approvedRes = await axios.put(`http://localhost:3001/invitations/user/${email}/approve`, 
                                      {  'from_email': fromEmail }, {headers: { Authorization: authToken}});
      if(approvedRes.data.approved && approvedRes.data.from_user_email === fromEmail){
        setApproveInvite(`${fromEmail} is now your friend`);
        loadFriends();
      }
    }
    else if(action === 'reject') {
      const rejectedRes = await axios.put(`http://localhost:3001/invitations/user/${email}/reject`, 
                                      {  'from_email': fromEmail }, {headers: { Authorization: authToken}});
      if(rejectedRes.data.rejected){
        setApproveInvite(`You have declined ${fromEmail}'s request`);
      }
    }
    loadPendingRequests();
    loadPendingInvites();
  }

  const loadPendingRequests = async() => {
    if(email){
      const res = await axios.get(`http://localhost:3001/invitations/user/requests/${email}`, {headers: { Authorization: authToken}});
      if(res.data.invitations && res.data.invitations.length !== 0){
      setPendingRequests(res.data.invitations);
      }
      else {
        setPendingRequests(['No pending invitation requests']);
      }
    }
  }

  const loadPendingInvites = async() => {
    if(email){
      const res = await axios.get(`http://localhost:3001/invitations/user/${email}`, {headers: { Authorization: authToken}});
      if(res.data.invitations && res.data.invitations.length !== 0){
      setPendingInvites(res.data.invitations);
      }
      else {
        setPendingInvites(['No pending invitations']);
      }
    }
  }

  const loadFriends = async(q='') => {
    if(email){
      const res = await axios.get(`http://localhost:3001/invitations/user/${email}/contacts?q=${q}`, {headers: { Authorization: authToken}});
      if(res.data.contacts.length !== 0){
        let {contacts} = res.data;
        let contactEmails = Object.keys(contacts);
        setFriends(contactEmails);
        updateEmailToLangDict(contacts);
      }
      else {
        setFriends(['You dont have any contacts. Send invites to initiate a conversation']);
      }
    }
  }

  const searchContacts = async(e) => {
    setSearchQuery(e.target.value);
    loadFriends(searchQuery);
  }
 
  useEffect(() => {
    loadFriends(searchQuery);
  },[friends.length, searchQuery]);
 

  useEffect(() => {
    loadPendingRequests();
  }, [pendingRequests.length]);
  
  useEffect(() => {
    loadPendingInvites();
  }, [pendingInvites.length]);

  return (
    <div>
      <SidebarHeader />

      <div className={classes.sidebarContainer}>
        <Paper square className={classes.root}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="on"
            indicatorColor="primary"
            textColor="primary"
            aria-label="icon label tabs example"
          >
            <Tab icon={<ForumIcon />} label="CHATS" />
            <Tab icon={<PersonPinIcon />} label="FRIENDS" />
            <Tab icon={<MailOutlineIcon />} label="INVITES" />
          </Tabs>
        </Paper>

        {value === 0 && (
          <ChatSummary />
        )}
        {value === 1 && (
          <h1>Friends display</h1>
        )}
        {value === 2 && (
          <h1>Invitations display</h1>
        )}

        <Contacts 
          friends={friends}
          loadPendingInvites = {loadPendingInvites}
          selected={props.selected}
          requestContact={props.requestContact}
          updateContact={updateContact}
          selectContact={props.selectContact}
          requests={pendingRequests}
          pending = {pendingInvites}
          search = {searchContacts}
        />
        <Snackbar open = {approveInvite.length !== 0} autoHideDuration={3000} onClose = { closeAlertHandler }>
          <Alert onClose={closeAlertHandler} severity="success">
            {approveInvite} 
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default Sidebar;