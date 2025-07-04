
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile } from '@/services/authService';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/auth';

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);

        if (session?.user) {
          // For demo accounts, set basic info immediately to reduce perceived lag
          const isDemoAccount = session.user.email === 'admin@demo.com' || session.user.email === 'student@demo.com';
          
          if (isDemoAccount) {
            const quickProfile = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: session.user.email === 'admin@demo.com' ? 'admin' as const : 'user' as const
            };
            setUser(quickProfile);
            setIsLoading(false);
            
            // Fetch complete profile in background
            setTimeout(async () => {
              try {
                const profile = await fetchUserProfile(session.user.id);
                if (profile) setUser(profile);
              } catch (error) {
                console.error('Background profile fetch failed:', error);
              }
            }, 0);
          } else {
            // Fetch user profile for regular accounts
            const profile = await fetchUserProfile(session.user.id);
            setUser(profile);
            setIsLoading(false);
          }
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        const isDemoAccount = session.user.email === 'admin@demo.com' || session.user.email === 'student@demo.com';
        
        if (isDemoAccount) {
          const quickProfile = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: session.user.email === 'admin@demo.com' ? 'admin' as const : 'user' as const
          };
          setSession(session);
          setUser(quickProfile);
          setIsLoading(false);
          
          // Background profile fetch
          fetchUserProfile(session.user.id).then(profile => {
            if (profile) setUser(profile);
          }).catch(console.error);
        } else {
          fetchUserProfile(session.user.id).then(profile => {
            setSession(session);
            setUser(profile);
            setIsLoading(false);
          });
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    setUser,
    setSession,
    setIsLoading
  };
};
