import validator from 'validator';

const validateLogin = formValues => {
  let formErrors = {};
  const { email, password } = formValues;
  if(validator.isEmpty(email)) {
    formErrors.email = 'Email is required';
  }
  else if(!validator.isEmail(email)) {
    formErrors.email = 'Email entered is invalid';
  }

  if(validator.isEmpty(password)) {
    formErrors.password = 'Password is required';
  }
  else if(!validator.isLength(password, {min: 6})) {
    formErrors.password = 'Password should have at least 6 characters';
  }

  return formErrors;
};

const validateEmailForPasswordChange = formValues => {
  let formErrors = {};
  const { email} = formValues;
  if(validator.isEmpty(email)) {
    formErrors.email = 'Email is required';
  }
  else if(!validator.isEmail(email)) {
    formErrors.email = 'Email entered is invalid';
  }

  return formErrors;
};

const validatePasswordForPasswordChange = formValues => {
  let formErrors = {};
  const { password, passwordConfirm } = formValues;

  if(validator.isEmpty(password)) {
    formErrors.password = 'Password is required';
  } else if(!validator.isLength(password, {min: 6})) {
    formErrors.password = 'Password should have at least 6 characters';
  }

  if(validator.isEmpty(passwordConfirm)) {
    formErrors.passwordConfirm = 'Confirmation password is required';
  } else if(!validator.isLength(passwordConfirm, {min: 6})) {
    formErrors.passwordConfirm = 'Confirmation password should have at least 6 characters';
  }

  if (password !== passwordConfirm) {
    formErrors.passwordMatch = 'The password and confirmation passwords must match.'
  }

  return formErrors;
};

export default validateLogin;