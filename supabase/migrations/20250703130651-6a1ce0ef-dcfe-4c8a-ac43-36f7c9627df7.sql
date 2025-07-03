
-- Insert demo users into the auth.users table would require admin access
-- Instead, let's create the user roles for existing or new users
-- First, let's ensure we have the admin and student roles available

-- Insert admin role for a user (you'll need to replace the user_id with actual user IDs after they sign up)
-- For now, let's create a more flexible approach where we can easily assign admin roles

-- Create a function to assign admin role to a user
CREATE OR REPLACE FUNCTION assign_admin_role(email_address TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the user ID from auth.users table
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = email_address;
    
    IF user_uuid IS NOT NULL THEN
        -- Insert or update the user role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (user_uuid, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END;
$$;

-- Create a function to assign user role to a user
CREATE OR REPLACE FUNCTION assign_user_role(email_address TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the user ID from auth.users table
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = email_address;
    
    IF user_uuid IS NOT NULL THEN
        -- Insert or update the user role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (user_uuid, 'user'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END;
$$;
