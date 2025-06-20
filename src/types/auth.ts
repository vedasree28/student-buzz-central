
import type { User, Session } from '@supabase/supabase-js';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export type AuthContextType = {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  handleGoogleLogin?: () => Promise<void>;
};
