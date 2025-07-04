
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
      name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
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
  const isDemoAccount = email === 'admin@demo.com' || email === 'student@demo.com';
  
  if (isDemoAccount) {
    return handleDemoAccountLogin(email, password);
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

const handleDemoAccountLogin = async (email: string, password: string) => {
  console.log('Attempting demo account login for:', email);
  
  try {
    // First, try to login directly
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      console.log('Demo account login successful');
      return data;
    }

    // If login fails, create the demo account
    if (error?.message.includes('Invalid login credentials')) {
      console.log('Creating demo account...');
      return await createDemoAccount(email, password);
    }

    // For other errors, throw them
    throw error;
  } catch (error) {
    console.error('Demo account login error:', error);
    throw error;
  }
};

const createDemoAccount = async (email: string, password: string) => {
  try {
    // Create the demo account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name: email === 'admin@demo.com' ? 'Admin User' : 'Student User',
          full_name: email === 'admin@demo.com' ? 'Admin User' : 'Student User',
        }
      }
    });

    if (signUpError) {
      console.error('Demo account creation failed:', signUpError);
      throw signUpError;
    }

    if (!signUpData.user) {
      throw new Error('Failed to create demo account');
    }

    console.log('Demo account created:', signUpData.user.id);

    // Assign role asynchronously to reduce lag
    const rolePromise = assignDemoRole(email);
    
    // Try to login immediately after account creation
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Wait for role assignment in background
    rolePromise.catch(error => {
      console.error('Role assignment failed (background):', error);
    });

    if (loginError) {
      console.error('Login after signup failed:', loginError);
      toast.error('Demo account created but login failed. Please try again.');
      throw loginError;
    }

    toast.success(`Demo account created and logged in successfully!`);
    return loginData;
  } catch (error) {
    console.error('Error creating demo account:', error);
    throw error;
  }
};

const assignDemoRole = async (email: string) => {
  try {
    if (email === 'admin@demo.com') {
      await supabase.rpc('assign_admin_role', { email_address: email });
      console.log('Admin role assigned');
    } else {
      await supabase.rpc('assign_user_role', { email_address: email });
      console.log('User role assigned');
    }
  } catch (error) {
    console.error('Error assigning role:', error);
    throw error;
  }
};

export const registerUser = async (name: string, email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: {
        name: name,
        full_name: name,
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
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
  
  if (error) {
    throw error;
  }
};
