import React, { useState } from 'react';
import axios from 'axios';

const AuthContext = React.createContext([{}, () => {}]);
function AuthProvider({children}) {
  const [state, setState] = React.useState({
    status: 'logged out',
    error: null,
    emailToLangDict: {},
  });
  const [user, setUser] = useState(null);

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setState({
      status: 'logged out',
      error: null,
    })
  }

  const login = async(formValues) => {
    try {
      const res = await axios.post('/user/login', formValues);
      if(res.data.token) {
        setState({status:'success', error:null});
        localStorage.setItem('authToken', res.data.token);
        setUser(res.data.user);
      }
    }
    catch(err) {
      const validationError = err.response.data.validationError || null;
      const missingDataError = err.response.data.missingData || null;
      if(validationError){
        setState({status: 'error', error: validationError});
        setUser(null)
      }
      else if(missingDataError) {
        setState({status: 'error', error: missingDataError});
        setUser(null)
      }
      else {
        console.error(err);
      }
    }
  }

  const updateEmailToLangDict = (dict) => {
    setState({...state, emailToLangDict: dict});
  }
  
  let authState = {...state, logout, login, updateEmailToLangDict, user}

  /**
   * Provider component is the place where you'd pass a prop called value to, 
   * which you can subsequently consume within the Consumer component
   */
  return (
    <AuthContext.Provider value={authState}>
      {state.status === 'pending' ? (
        'Loading...'
      ) : state.status === 'logged out' ? (
        children
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

//this seems simpler method to pass functions from context to consumers
function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error(`useAuth must be used within a AuthProvider`)
  }
  return context;
}

export {AuthProvider, useAuth};