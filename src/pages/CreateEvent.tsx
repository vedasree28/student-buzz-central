
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import EventForm from '@/components/EventForm';

const CreateEvent = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return <EventForm mode="create" />;
};

export default CreateEvent;
