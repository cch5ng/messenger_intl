import { useState } from 'react';

const useForm = (validate) => {
  const [formValues, setFormValues] = useState({ email: '', password: '', confirmPassword: '', language: 'english'});
  const [formErrors, setFormErrors] = useState({});
  
  const handleChange = event => {
    const { name, value} = event.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleSubmit = submitCallback => {
    let errors = validate(formValues)
    if (!Object.keys(errors).length) {
      submitCallback();
    } else {
      setFormErrors(errors);
    }
  }

  return {
    handleChange,
    handleSubmit,
    formValues,
    formErrors
  }
}

export default useForm;