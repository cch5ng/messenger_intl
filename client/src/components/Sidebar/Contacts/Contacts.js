import React, { useState, Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Friends from './Friends';
import Requests from './Requests';
import Pending from './Pending';

const useStyles = makeStyles(theme => ({
  invitationHeadings: {
    marginBottom: 0,
    marginTop: '2rem'
  },
  tabsText: {
    fontSize: '1rem',
    fontWeight: 'bold'
  }
}));

const Contacts = props => {
  const classes = useStyles();
  const [display, setDisplay] = useState('friends');
  const toggleDisplay = (event, setting) => {
    setDisplay(setting);
  }

  return (
    <Grid
      container
      direction='column'
    >
      <Grid item >
        <Tabs 
          value={display} 
          onChange={toggleDisplay} 
          variant='scrollable' 
          scrollButtons='auto' 
          indicatorColor='primary'
        >
          <Tab 
            value='friends' 
            label='Friends' 
            disableRipple
            className={classes.tabsText}
          />
          <Tab 
            value='invitations' 
            label='Invitations'
            disableRipple 
            className={classes.tabsText}
          />
        </Tabs>
      </Grid>

      {display === 'friends' && 
        <Friends 
          friends={props.friends}
          selected={props.selected} 
          requestContact={props.requestContact}
          selectContact={props.selectContact}
          loadPendingInvites = {props.loadPendingInvites}
          search = {props.search}
        />
      }
      {display === 'invitations' && 
        <Fragment>
        <Requests 
          requests={props.requests} 
          updateContact={props.updateContact}
          classes={classes}
        />
        <Pending pending={props.pending} classes={classes}/>
        </Fragment>
      }
    </Grid>
  );
}

export default Contacts;