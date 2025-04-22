
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventContext';
import EventForm from '@/components/EventForm';

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { events } = useEvents();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  const eventExists = events.some(event => event.id === id);
  
  if (!eventExists) {
    return <Navigate to="/events" />;
  }
  
  return <EventForm mode="edit" />;
};

export default EditEvent;
