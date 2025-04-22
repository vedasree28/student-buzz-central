
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/AdminDashboard';
import UserDashboard from '@/components/UserDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="container py-8 flex justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
};

export default Dashboard;
