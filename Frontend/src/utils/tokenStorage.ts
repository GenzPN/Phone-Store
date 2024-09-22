const TOKEN_KEY = 'accessToken';

export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

export const getToken = (): string | null => {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// New cookie functions
export const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; domain=localhost; SameSite=Strict; Secure`;
};

export const getCookie = (name: string) => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

export const removeCookie = (name: string) => {
  document.cookie = name + '=; Max-Age=-99999999; path=/';
};