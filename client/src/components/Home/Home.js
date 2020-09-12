import React from 'react';
import {useAuth} from '../../context/auth-context';
import AuthenticatedApp from '../AuthenticatedApp/AuthenticatedApp';
import UnauthenticatedApp from '../UnauthenticatedApp/UnauthenticatedApp';

function Home() {
  const {user} = useAuth();
  return user ? <AuthenticatedApp /> : <UnauthenticatedApp />
}

export default Home;
