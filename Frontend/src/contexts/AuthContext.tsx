import React, { createContext, useContext } from 'react';

interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  fullName: string;
}

interface AuthContextType {
  user: UserData | null;
  handleLogin: (userData: UserData, accessToken: string) => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthContextType & { children: React.ReactNode }> = ({ 
  user, 
  handleLogin, 
  handleLogout, 
  children 
}) => {
  return (
    <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
