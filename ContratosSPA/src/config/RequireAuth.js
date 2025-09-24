import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import * as helpers from '../helpers/auth-helper';

export default function RequireAuth() {
  const isAuthed = helpers.isLoggedIn();
  const loc = useLocation();
  return isAuthed ? <Outlet /> : <Navigate to="/" replace state={{ from: loc }} />;
}
