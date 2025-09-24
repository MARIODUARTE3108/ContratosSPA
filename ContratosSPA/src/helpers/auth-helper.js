export const signIn = (data) => {
  localStorage.setItem('USER_AUTH', JSON.stringify(data));
}

export const getNomeUsuario = () => {
  try {
    const user = JSON.parse(localStorage.getItem('USER_AUTH'));
    return user?.nome || '';
  } catch {
    return '';
  }
}

export const getAccessToken = () => {
  try {
    const raw = localStorage.getItem('USER_AUTH');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return  user.access_token ?? null;
  } catch {
    return null;
  }
};


export const signOut = () => {
  localStorage.removeItem('USER_AUTH');
}

export const isLoggedIn = () => {
  return !!localStorage.getItem('USER_AUTH');
}
