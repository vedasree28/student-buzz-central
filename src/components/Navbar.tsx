
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Calendar, LogOut, Menu, User, Mail, X } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">StudentBuzz</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-blue-600">
            Home
          </Link>
          <Link to="/events" className="text-sm font-medium transition-colors hover:text-blue-600">
            Events
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-blue-600">
              Dashboard
            </Link>
          )}
        </nav>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* User Email with Icon */}
              <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-100 border border-slate-200">
                <Mail size={16} className="text-blue-600" />
                <span className="text-sm text-gray-700 font-medium">{user?.email}</span>
              </div>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/notifications">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                    3
                  </span>
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="w-full cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> 
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 h-[calc(100vh-4rem)] bg-background md:hidden">
          <div className="container p-6 flex flex-col space-y-4">
            <Link to="/" className="flex items-center py-2" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/events" className="flex items-center py-2" onClick={() => setMobileMenuOpen(false)}>
              Events
            </Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="flex items-center py-2" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
            )}
            <div className="h-px w-full bg-border" />
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-100 border border-slate-200">
                  <Mail size={16} className="text-blue-600" />
                  <span className="text-sm text-gray-700 font-medium">{user?.email}</span>
                </div>
                <Link to="/profile" className="flex items-center py-2" onClick={() => setMobileMenuOpen(false)}>
                  Profile
                </Link>
                <Link to="/notifications" className="flex items-center py-2" onClick={() => setMobileMenuOpen(false)}>
                  Notifications
                </Link>
                <Button variant="destructive" className="w-full" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Link to="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
