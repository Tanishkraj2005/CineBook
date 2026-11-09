import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cinebook_token');
    if (token) {
      getMe()
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('cinebook_user', JSON.stringify(res.data));
          } else {
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('cinebook_token');
          localStorage.removeItem('cinebook_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    if (res.success && res.data) {
      localStorage.setItem('cinebook_token', res.data.token);
      localStorage.setItem('cinebook_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (name, email, password, phone) => {
    const res = await apiRegister(name, email, password, phone);
    if (res.success && res.data) {
      localStorage.setItem('cinebook_token', res.data.token);
      localStorage.setItem('cinebook_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('cinebook_token');
    localStorage.removeItem('cinebook_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

