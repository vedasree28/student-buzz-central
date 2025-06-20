
import React, { createContext, useContext } from 'react';
import { toast } from "sonner";
import { useAuthState } from '@/hooks/useAuthState';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  signInWithGoogle,
  fetchUserProfile 
} from '@/services/authService';
import type { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, isLoading, setUser, setSession, setIsLoading } = useAuthState();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const data = await loginUser(email, password);

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);
        setSession(data.session);
        toast.success(`Welcome back!`);
      }
    } catch (error: any) {
      const message = error?.message || 'Login failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const data = await registerUser(name, email, password);

      if (data.user) {
        toast.success('Registration successful! Please check your email to confirm your account.');
      }
    } catch (error: any) {
      const message = error?.message || 'Registration failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setSession(null);
      toast.info('You have been logged out');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user && !!session,
        login,
        register,
        logout,
        handleGoogleLogin,
      }}
    >
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
