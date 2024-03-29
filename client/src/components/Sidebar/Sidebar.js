import React, { useState, useEffect, Fragment } from 'react';
//import Contacts from './Contacts/Contacts';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ForumIcon from '@material-ui/icons/Forum';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import PersonPinIcon from '@material-ui/icons/PersonPin';
import axios from 'axios';

import SidebarHeader from './SidebarHeader';
import ChatSummary from './ChatSummary/ChatSummary';
import Friends from './Contacts/Friends';
import Requests from './Contacts/Requests';
import Pending from './Contacts/Pending';
import {useAuth} from '../../context/auth-context';

const useStyles = makeStyles(() => ({
  sidebarContainer : {
    maxHeight: '85vh',
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  invitationHeadings: {
    marginBottom: 0,
    marginTop: '2rem'
  },
  tabsText: {
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  tabsBackground: {
    flexGrow: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)'
  }
}));

const Sidebar = props => {
  const {user, updateEmailToLangDict, logout} = useAuth();
  const email = user.email;
  const authToken = localStorage.getItem('authToken');
  const [friends, setFriends] = useState([]);
  const [approveInvite, setApproveInvite] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  //const [searchQuery, setSearchQuery] = useState('');
  const [value, setValue] = useState(0);
  const classes = useStyles();

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
      const approvedRes = await axios.put(`/invitations/user/${email}/approve`, 
                                      {  'from_email': fromEmail }, 
                                      {headers: { Authorization: `Bearer ${authToken}`}});
      if(approvedRes.data.approved && approvedRes.data.from_user_email === fromEmail){
        setApproveInvite(`${fromEmail} is now your friend`);
        loadFriends();
      }
    }
    else if(action === 'reject') {
      const rejectedRes = await axios.put(`/invitations/user/${email}/reject`, 
                                      {  'from_email': fromEmail }, 
                                      {headers: { Authorization: `Bearer ${authToken}`}});
      if(rejectedRes.data.rejected){
        setApproveInvite(`You have declined ${fromEmail}'s request`);
      }
    }
    loadPendingRequests();
    loadPendingInvites();
  }

  const loadPendingRequests = async() => {
    if(email){
      const res = await axios.get(`/invitations/user/requests/${email}`, 
                                {headers: { Authorization: `Bearer ${authToken}`}});
      if (res.status === 401) {
        logout();
        return;
      }
      if(res.data.invitations && res.data.invitations.length !== 0){
        setPendingRequests(res.data.invitations);
      } else {
        setPendingRequests(['No pending invitation requests']);
      }
    }
  }

  const loadPendingInvites = async() => {
    if(email){
      const res = await axios.get(`/invitations/user/${email}`, 
                                {headers: { Authorization: `Bearer ${authToken}`}});
      if (res.status === 401) {
        logout();
        return;
      }
      if (res.data.invitations && res.data.invitations.length !== 0){
        setPendingInvites(res.data.invitations);
      } else {
        setPendingInvites(['No pending invitations']);
      }
    }
  } 

  const loadFriends = async(q='') => {
    if(email){
      let authToken = localStorage.getItem('authToken');
      const res = await axios.get(`/invitations/user/${email}/contacts`, //?q=${q} 
                                {headers: { Authorization: `Bearer ${authToken}`}});
      if (res.status === 401) {
        logout();
        return;
      }
      if (res.data.contacts.length !== 0){
        let {contacts} = res.data;
        let contactEmails = Object.keys(contacts);
        setFriends(contactEmails);
        updateEmailToLangDict(contacts);
      } else {
        setFriends([]);
        updateEmailToLangDict({});
      }
    }
  }

  // const searchContacts = async(e) => {
  //   let query = e.target.value;
  //   setSearchQuery(query);
  //   loadFriends(query);
  // }

  //BUG infinite loop, related to updateEmailToLangDict?
  useEffect(() => {
    const loadFriends = async(q='') => {
//      if(email){
        let authToken = localStorage.getItem('authToken');
        const res = await axios.get(`/invitations/user/${email}/contacts`, //?q=${q} 
                                  {headers: { Authorization: `Bearer ${authToken}`}});
        // if (res.status === 401) {
        //   logout();
        //   return;
        // }
        if (res.data.contacts.length !== 0){
          let {contacts} = res.data;
          let contactEmails = Object.keys(contacts);
          setFriends(contactEmails);
          updateEmailToLangDict(contacts);
        } else {
          setFriends([]);
          updateEmailToLangDict({});
        }
      //}
    }  
    if (email) {
      loadFriends();
    }
  }, [email]) //logout, updateEmailToLangDict

  useEffect(() => {
    const loadPendingRequests = async() => {
      if(email){
        const res = await axios.get(`/invitations/user/requests/${email}`, 
                                  {headers: { Authorization: `Bearer ${authToken}`}});
        // if (res.status === 401) {
        //   logout();
        //   return;
        // }
        if(res.data.invitations && res.data.invitations.length !== 0){
          setPendingRequests(res.data.invitations);
        } else {
          setPendingRequests(['No pending invitation requests']);
        }
      }
    }  

    loadPendingRequests();
  }, [pendingRequests.length, email, authToken]);//logout
  
  useEffect(() => {
    const loadPendingInvites = async() => {
      if(email){
        const res = await axios.get(`/invitations/user/${email}`, 
                                  {headers: { Authorization: `Bearer ${authToken}`}});
        // if (res.status === 401) {
        //   logout();
        //   return;
        // }
        if (res.data.invitations && res.data.invitations.length !== 0){
          setPendingInvites(res.data.invitations);
        } else {
          setPendingInvites(['No pending invitations']);
        }
      }
    }

    loadPendingInvites();
  }, [pendingInvites.length, email, authToken ]); //logout

  return (
    <div>
      <SidebarHeader />
      <div className={classes.sidebarContainer}>
        <nav className={classes.tabsBackground} aria-label="Main Navigation">
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
        </nav>
        {value === 0 && (
          <ChatSummary />
        )}
        {value === 1 && (
          <Friends
            selected={props.selected} 
            requestContact={props.requestContact}
            selectContact={props.selectContact}
            loadPendingInvites = {loadPendingInvites}
            friends={friends}
            // searchContacts={searchContacts}
          />
        )}
        {value === 2 && (
          <Fragment>
            <Requests 
              requests={pendingRequests} 
              updateContact={updateContact}
              classes={classes}
            />
            <Pending pending={pendingInvites} classes={classes}/>
          </Fragment>
        )}
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