import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

import useForm from '../../custom-hooks/useForm';
import validate from '../Login/validateLogin';
import { useAuth } from '../../context/auth-context';

const useStyles = makeStyles((theme) => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  submit: {
    margin: theme.spacing(6, 0, 2),
    width: '10rem',
    height: '3rem'
  },
  mainContainer : {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  welcomeHeading : {
    fontWeight: theme.typography.fontWeightBold
  },
  textFieldSelectLabel: {
    fontSize: '15px',
  },
  buttonMarginRight : {
    marginLeft: '1rem'
  },
  body2Style : {
    marginBottom: '40px',
    fontSize: '15px'
  },
  routerLink : {
    textDecoration: 'none'
  },
  adornmentStyle: {
    color: theme.palette.primary.main
  }
}));

const PasswordChangeRequest = () => {

  const classes = useStyles();
  const { handleChange, handleSubmit, formValues, formErrors } = useForm(submit, validate);
  const [errorAlertMsg, setErrorAlertMsg] = useState('');
  const authState = useAuth();

  function submit() {
    authState.login(formValues);
  }

  function closeAlertHandler() {
    setErrorAlertMsg('');
  }

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  return (
    <div>
      <h1>TODO Password Change Request</h1>
    
    
    
      <form onSubmit= { handleSubmit } className={classes.form} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              InputProps = {{ 
                classes: {root: classes.textFieldSelectLabel} 
              }}
              InputLabelProps = {{ 
                classes: {root: classes.textFieldSelectLabel} 
              }}
              value={ formValues.email }
              onChange = { handleChange }
              error = { formErrors.email }
              helperText = { formErrors.email || null }
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.submit}
          >
          Get Link
        </Button>
      </form>
      <Snackbar open = {errorAlertMsg.length !== 0} autoHideDuration={5000} onClose = { closeAlertHandler }>
        <Alert onClose={closeAlertHandler} severity="error">
          {errorAlertMsg}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default PasswordChangeRequest;

