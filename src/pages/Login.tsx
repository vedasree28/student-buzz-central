
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, AlertCircle } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex items-center justify-center rounded-full bg-blue-100 p-2">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to sign in to your account
          </p>
        </div>
        
        <div className="grid gap-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-500 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div className="grid">
                <GoogleSignInButton />
              </div>
              
              <div className="text-center text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-800">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Demo Accounts
              </span>
            </div>
          </div>
          
          <div className="rounded-md bg-blue-50 border border-blue-200 p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Troubleshooting Demo Accounts</p>
                <p className="mt-1">
                  If demo accounts still ask for email confirmation after disabling it in settings, 
                  go to your Supabase Dashboard → Authentication → Users and manually confirm or delete the existing demo accounts.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid gap-2 text-sm">
            <div className="rounded-md bg-muted p-3 flex justify-between items-center">
              <div>
                <div className="font-medium">Admin Account</div>
                <div className="text-muted-foreground">admin@demo.com / admin123</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setEmail('admin@demo.com');
                  setPassword('admin123');
                }}
              >
                Use
              </Button>
            </div>
            
            <div className="rounded-md bg-muted p-3 flex justify-between items-center">
              <div>
                <div className="font-medium">Student Account</div>
                <div className="text-muted-foreground">student@demo.com / student123</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setEmail('student@demo.com');
                  setPassword('student123');
                }}
              >
                Use
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
