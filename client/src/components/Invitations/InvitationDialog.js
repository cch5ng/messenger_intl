import React from 'react';
import {theme} from "../../themes/theme";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogActions from '@material-ui/core/DialogActions';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import NavigationIcon from '@material-ui/icons/Navigation';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';

//REMOVE
const testToUid = '5ec815fdfd43011d98648662';
const testFromUid = '5ec816abfd43011d98648663';

const useStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    dialogContentTextRoot: {
      fontWeight: 'bold',
      color: theme.palette.text.primary,
      marginBottom: 0,
    },
    dialogActionsRoot: {
      justifyContent: 'center',
      margin: theme.spacing(3),
    },
    btn: {
      fontWeight: '600'
    },
    btnMixedCase: {
      textTransform: 'unset !important',
      fontWeight: '600',
      fontSize: theme.spacing(2),
    },
    btnMixedCaseCenter: {
      textTransform: 'unset !important',
      fontWeight: '600',
      fontSize: theme.spacing(2),
      alignItem: 'center',
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.action.disabled,
    },
    btnOverlay: {
      zIndex: '2000',
      position: 'absolute',
      right: theme.spacing(4),
      top: theme.spacing(32.5),
    }
  }));

const dialogTitleStyles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  title: {
    color: theme.palette.text.primary,
    align: 'center',
    margin: theme.spacing(3),
    fontWeight: 'bold'
  }
});

const DialogTitle = withStyles(dialogTitleStyles)((props) => {
  const { children, classes, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <div>
        <Typography variant="h5" className={classes.title}
          align="center">
            {children}
        </Typography>
      </div>
    </MuiDialogTitle>
  );
});

export default function InvitationDialog() {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [referralUrl, setReferralUrl] = React.useState('http://www.messenger.com/join/123456');
  const classes = useStyles();

  const handleChange = (event) => {
    const {value} = event.target
    setEmail(value.trim());
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (ev) => {
    setOpen(false);
  }

  //handle submit form
  const handleSave = (ev) => {
    ev.preventDefault();
    //TODO
    let jwtToken = '';
    let emailStr = email;
    let emailAr = [];
    //clean up email field string
    if (emailStr.indexOf(',') > -1) {
      emailAr = getEmailAr(email);
    } else {
      emailAr.push(email);
    }

    let body = {emailAr, to_user_id: `${testToUid}`};
    //make post request
    fetch(`http://localhost:3001/invitations/user/${testFromUid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'//,
        //'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify(body)
    })
      .then(resp => {
        setEmail('');
        setOpen(false);
      })
      .catch(err => {
        console.error(err)
      })
  };

  const getEmailAr = (emailStr) => {
    let emailAr = emailStr.split(',');
    emailAr = emailAr.map(email => email.trim());
    return emailAr;
  }

  const handleClickCopyBtn = (ev) => {
    ev.preventDefault();
    navigator.permissions.query({name: "clipboard-write"}).then(result => {
      if (result.state == "granted" || result.state == "prompt") {
        if (navigator.clipboard) {
          let url = referralUrl
          navigator.clipboard.writeText(url).then(function() {
          }, function() {
            console.log('Cannot copy url to the clipboard. Please copy it manually.')
          });  
        }
      }
    });
  }

  return (
    <div>
      <Button color="primary" onClick={handleClickOpen}
        className={classes.btnMixedCase} >
        + Invite Friends
      </Button>
      <Dialog open={open} onClose={handleClose} 
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth='sm'>

        <IconButton aria-label="close" className={classes.closeButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
        <DialogTitle id="form-dialog-title" onClose={handleClose}>
          Invite Friends to Messenger
        </DialogTitle>
        <DialogContent>
          <DialogContentText className={classes.dialogContentTextRoot}>
            Send your friends an invite email.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            type="email"
            variant="outlined"
            value={email}
            onChange={handleChange}
            helperText="Separate multiple emails with a comma."
            InputLabelProps={{style: {fontSize: 18, color: '#000'}}}
            fullWidth
          />
        </DialogContent>

        <DialogContent>
          <DialogContentText className={classes.dialogContentTextRoot}>
            Or share referral link:
          </DialogContentText>
          <TextField
            margin="dense"
            id="referral-url"
            value={referralUrl}
            InputProps={{
              readOnly: true,
            }}
            variant="filled"
            fullWidth
            InputLabelProps={{
              classes: {
                root: classes.labelRoot,
                focused: classes.labelRoot
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            color="primary" 
            variant="contained"
            id="referral-url-btn"
            value={referralUrl}
            onClick={handleClickCopyBtn}
            className={classes.btnOverlay}
            disableElevation>
            Copy Link
          </Button>
        </DialogActions>
        <DialogActions className={classes.dialogActionsRoot}>
          <Button onClick={handleSave} color="primary" variant="contained"
            size="large" disableElevation className={classes.btnMixedCase}>
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
