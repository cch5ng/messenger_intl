import React, { useState } from 'react'
import Grid from '@material-ui/core/Grid';
import { MuiThemeProvider, Hidden, IconButton, Drawer } from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import {theme} from "../../themes/theme";
import Sidebar from '../Sidebar/Sidebar';
import Chat from '../Chat/Chat';
import { useAuth } from '../../context/auth-context';
import {SocketProvider} from '../../context/socket-context';

const appStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.04)'
};

const drawerWidth = '100%';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: '0',
    },
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth
  },
  closeMenuButton: {
    marginRight: 'auto',
    marginLeft: 0,
  }

}));

const AppContainer = (props) => {
  let {user} = useAuth();
  let chatType = props.chatType ? props.chatType : 'empty';
  const classes = useStyles();
  const [mobileMenuOpen, setMobileMenuOpen] = useState('false');

  const handleMobileMenuToggle = () => setMobileMenuOpen(!mobileMenuOpen);
  const drawer = (<Sidebar/>);

  return (
    <SocketProvider>
      <Grid container 
      spacing={0} direction='row' 
      className={classes.root}>
        <Hidden xsDown>
          <Grid item xs={12} sm={5} style={appStyle}>
              <Sidebar/>
          </Grid>
        </Hidden>
        <Grid item xs={12} sm={7} style={appStyle}>
        <IconButton
              color="inherit"
              aria-label="Open drawer"
              edge="start"
              onClick={handleMobileMenuToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
          </IconButton>
        <Hidden smUp>
          <Drawer variant='temporary'
                  anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                  open={mobileMenuOpen}
                  onClose={handleMobileMenuToggle}
                  classes = {{
                    paper: classes.drawerPaper
                  }}
                  ModalProps= {{
                    keepMounted: true
                  }}>      
            <IconButton onClick={handleMobileMenuToggle} className={classes.closeMenuButton}>
              <CloseIcon/>
            </IconButton>
            {drawer}        
          </Drawer>
        </Hidden>
        <Chat user={user.email} chatType={chatType} />
        </Grid>
      </Grid>
    </SocketProvider>

  )
}

const AuthenticatedApp = () => {
  return (
    <MuiThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route exact path="/">
            <AppContainer />
          </Route>
          <Route exact path="/conversations/new">
            <AppContainer chatType="new"/>
          </Route>
          <Route exact path="/conversations/:conversationId">
            <AppContainer chatType="existing"/>
          </Route>
          <Route exact path="/login">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Router>
    </MuiThemeProvider>
  )
}

export default AuthenticatedApp;
