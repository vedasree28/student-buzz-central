import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import type { UserProfile } from '@/types/auth';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // Get the user's role from user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleError) {
      console.error('Error fetching user role:', roleError);
      // Default to 'user' role if no role found
    }

    // Get user data from auth
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error('Error fetching auth user:', authError);
      return null;
    }

    const authUser = authData.user;
    
    // Construct user profile from available data
    const userProfile: UserProfile = {
      id: userId,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      role: roleData?.role || 'user'
    };

    return userProfile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

export const loginUser = async (email: string, password: string) => {
  // Check if this is a demo account login attempt
  const isDemoAccount = email === 'admin@demo.com' || email === 'student@demo.com';
  
  if (isDemoAccount) {
    console.log('Attempting demo account login...');
    
    // Try to login first
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If login fails, create the demo account
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        console.log('Demo account not found, creating it...');
        
        // Create the demo account with email confirmation disabled
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name: email === 'admin@demo.com' ? 'Admin User' : 'Student User',
            }
          }
        });

        if (signUpError) {
          console.error('Demo account creation failed:', signUpError);
          throw signUpError;
        }

        // If signup was successful, assign the appropriate role
        if (signUpData.user) {
          console.log('Demo account created successfully:', signUpData.user.id);
          
          try {
            if (email === 'admin@demo.com') {
              await supabase.rpc('assign_admin_role', { email_address: email });
              console.log('Admin role assigned successfully');
            } else {
              await supabase.rpc('assign_user_role', { email_address: email });
              console.log('User role assigned successfully');
            }
          } catch (roleError) {
            console.error('Error assigning role:', roleError);
          }

          // Since email confirmation is disabled, the user should be automatically logged in
          // Try to login again immediately after account creation
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (loginError) {
            console.error('Login after signup failed:', loginError);
            toast.error('Demo account created but login failed. Please try logging in again.');
            throw loginError;
          }

          toast.success('Demo account created and logged in successfully!');
          return loginData;
        }
      } else {
        // Other errors
        console.error('Demo account login error:', error);
        throw error;
      }
    } else {
      // Login was successful
      console.log('Demo account login successful');
      return data;
    }
  }

  // Regular login for non-demo accounts
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const registerUser = async (name: string, email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: {
        name: name,
      }
    }
  });

  if (error) {
    throw error;
  }

  // Assign default user role for new registrations
  if (data.user) {
    try {
      await supabase.rpc('assign_user_role', { email_address: email });
    } catch (roleError) {
      console.error('Error assigning user role:', roleError);
    }
  }

  return data;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
};

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`
    }
  });
  
  if (error) {
    throw error;
  }
};
