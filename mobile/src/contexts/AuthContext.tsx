import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { login as loginAction, logout as logoutAction } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    shop: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const login = async (userData: User) => {
    try {
      await dispatch(loginAction({ email: userData.email, password: '' })).unwrap();
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutAction()).unwrap();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 