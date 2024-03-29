import React, {useState, useRef, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { Badge } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import {useAuth} from '../../context/auth-context';
import styles from './Sidebar.module.css';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  purple: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
  },
  orange: {
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: deepOrange[500],
  },
  chatHeaderName: {
    padding: '0 5px',
  },
  paper: {
    marginRight: theme.spacing(2),
  },
  moreHorizIcon: {
    cursor: 'pointer',
    '&:hover' : {
      color: '#1976D2'
    }
  },
  customBadge: {
    backgroundColor: '#01FF70'
  }
}));

const SidebarHeader = (props) => {
  const {user, logout} = useAuth();
  const email = user.email;
  const initial = user.email[0].toUpperCase();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);


  const handleLogout = () => {
    logout();
  }

  return (
    <header className={styles.headerContainer} aria-label="Main Header">
      <div className={styles.headerLeft}>
        <Badge 
          anchorOrigin={{ 
            vertical: 'bottom', 
            horizontal: 'right' 
          }}  
          badgeContent=" "
          classes = {{
            badge: classes.customBadge
          }}>
          <Avatar className={classes.purple}>{initial}</Avatar>
        </Badge>
        {/* <h1 className={classes.chatHeaderName}>{email.split('@')[0]}</h1> */}
        <Typography className={classes.chatHeaderName} component="h1" variant="h5">
          {email.split('@')[0]}
        </Typography>
      </div>
      <div className={styles.headerSpacer} />
      <nav className={styles.headerRight} aria-label="Secondary Navigation">
        <MoreHorizIcon 
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          className={classes.moreHorizIcon}
         />
        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open} id="menu-list-grow">
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </nav>
    </header>
  )
}

export default SidebarHeader;