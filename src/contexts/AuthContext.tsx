
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  handleGoogleLogin?: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@campus.edu',
    password: 'admin123',
    role: 'admin' as const,
  },
  {
    id: '2',
    name: 'Student User',
    email: 'student@campus.edu',
    password: 'student123',
    role: 'user' as const,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user in localStorage on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);

    // Also check for Supabase Auth session
    const checkSupabaseSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const email = data.session.user.email;
        if (email) {
          // Check if it's one of our mock users
          const mockUser = MOCK_USERS.find(u => u.email === email);
          if (mockUser) {
            const { password: _, ...userWithoutPassword } = mockUser;
            setUser(userWithoutPassword);
            localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          } else {
            // Create a new user object for Supabase user
            const newUser = {
              id: data.session.user.id,
              name: email.split('@')[0], // Use part of email as name
              email: email,
              role: 'user' as const,
            };
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
          }
        }
      }
      setIsLoading(false);
    };
    
    checkSupabaseSession();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const email = session.user.email;
          if (email) {
            // Check if it's one of our mock users
            const mockUser = MOCK_USERS.find(u => u.email === email);
            if (mockUser) {
              const { password: _, ...userWithoutPassword } = mockUser;
              setUser(userWithoutPassword);
              localStorage.setItem('user', JSON.stringify(userWithoutPassword));
            } else {
              // Create a new user object for Supabase user
              const newUser = {
                id: session.user.id,
                name: email.split('@')[0], // Use part of email as name
                email: email,
                role: 'user' as const,
              };
              setUser(newUser);
              localStorage.setItem('user', JSON.stringify(newUser));
            }
            toast.success(`Welcome back, ${email.split('@')[0]}!`);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('user');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API request delay
      await new Promise(r => setTimeout(r, 1000));
      
      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Save user to state and localStorage
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      toast.success(`Welcome back, ${userWithoutPassword.name}!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API request delay
      await new Promise(r => setTimeout(r, 1000));
      
      // Check if email is already taken
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }
      
      // In a real app, we would save to a database
      // For demo, we'll just pretend it worked
      const newUser = {
        id: `${MOCK_USERS.length + 1}`,
        name,
        email,
        role: 'user' as const,
      };
      
      // Save user to state and localStorage
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success('Registration successful!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    supabase.auth.signOut().then(() => {
      setUser(null);
      localStorage.removeItem('user');
      toast.info('You have been logged out');
    });
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      
      if (error) {
        console.error('Google login failed:', error.message);
        toast.error(`Google login failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
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
