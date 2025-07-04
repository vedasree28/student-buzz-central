
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
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
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
            // For Google OAuth and regular accounts, fetch user profile
            try {
              const profile = await fetchUserProfile(session.user.id);
              setUser(profile);
              
              // If this is a Google OAuth sign-in and we're on login page, redirect to dashboard
              if (event === 'SIGNED_IN' && 
                  session.user.app_metadata?.provider === 'google' && 
                  window.location.pathname === '/login') {
                console.log('Redirecting Google user to dashboard');
                window.location.href = '/dashboard';
                return;
              }
            } catch (error) {
              console.error('Profile fetch failed:', error);
              // For Google users, create a basic profile if fetch fails
              const basicProfile = {
                id: session.user.id,
                name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: 'user' as const
              };
              setUser(basicProfile);
              
              // Assign user role for Google OAuth users who don't have one yet
              if (session.user.app_metadata?.provider === 'google') {
                try {
                  await supabase.rpc('assign_user_role', { email_address: session.user.email });
                } catch (roleError) {
                  console.error('Error assigning role to Google user:', roleError);
                }
              }
            }
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
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
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
            
            // Check if we need to redirect after Google OAuth
            if (session.user.app_metadata?.provider === 'google' && 
                window.location.pathname === '/login') {
              console.log('Redirecting existing Google user to dashboard');
              window.location.href = '/dashboard';
            }
          }).catch(error => {
            console.error('Profile fetch failed:', error);
            // Create basic profile for existing Google users
            const basicProfile = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: 'user' as const
            };
            setSession(session);
            setUser(basicProfile);
            setIsLoading(false);
            
            // Redirect Google users
            if (session.user.app_metadata?.provider === 'google' && 
                window.location.pathname === '/login') {
              console.log('Redirecting Google user with basic profile to dashboard');
              window.location.href = '/dashboard';
            }
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
