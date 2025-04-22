import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents, EventType } from '@/contexts/EventContext';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, User, Home, MapPinOff } from 'lucide-react';
import { format } from 'date-fns';

const getCampusTypeBadge = (campusType: "on" | "off") => {
  if (campusType === "on") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-[#E5DEFF] px-2 py-0.5 text-xs font-medium text-[#6E59A5]">
        <Home className="w-4 h-4 inline" /> On Campus
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded bg-[#D3E4FD] px-2 py-0.5 text-xs font-medium text-[#0EA5E9]">
      <MapPinOff className="w-4 h-4 inline" /> Off Campus
    </span>
  );
};

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { 
    events, 
    userRegistrations, 
    registerForEvent, 
    unregisterFromEvent,
    getEventStatus,
  } = useEvents();
  
  const event = events.find(event => event.id === id);
  
  if (!event) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <Button onClick={() => navigate('/events')}>Back to Events</Button>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
  };

  const isRegistered = userRegistrations.includes(event.id);
  const status = getEventStatus(event);
  const isPastEvent = status === 'past';
  const availableSpots = event.capacity - event.registeredUsers.length;
  
  const handleRegister = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user) {
      registerForEvent(event.id, user.id);
    }
  };
  
  const handleUnregister = () => {
    if (user) {
      unregisterFromEvent(event.id, user.id);
    }
  };
  
  const handleEdit = () => {
    navigate(`/events/${event.id}/edit`);
  };
  
  const getStatusBadge = () => {
    switch(status) {
      case 'upcoming':
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      case 'ongoing':
        return <Badge className="bg-green-500">Ongoing</Badge>;
      case 'past':
        return <Badge className="bg-gray-500">Past</Badge>;
    }
  };
  
  return (
    <div className="container py-12">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => navigate('/events')}
      >
        Back to Events
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              {getStatusBadge()}
              <Badge className="bg-purple-500">{event.category}</Badge>
              {getCampusTypeBadge(event.campusType)}
            </div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="text-muted-foreground">{event.description}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 py-4 border-y">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(event.startDate)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(event.endDate)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <Users className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <p className="font-medium">Capacity</p>
                <p className="text-sm text-muted-foreground">
                  {event.registeredUsers.length} registered out of {event.capacity} spots
                  ({availableSpots} spots left)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <p className="font-medium">Organizer</p>
                <p className="text-sm text-muted-foreground">{event.organizer}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg h-fit space-y-6">
          <div className="aspect-video rounded-md overflow-hidden">
            <img 
              src={event.imageUrl} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {user?.role === 'admin' && (
            <Button className="w-full" onClick={handleEdit}>
              Edit Event
            </Button>
          )}
          
          {!isPastEvent && user?.role !== 'admin' && (
            <>
              {isRegistered ? (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleUnregister}
                >
                  Cancel Registration
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleRegister}
                  disabled={availableSpots <= 0}
                >
                  {availableSpots > 0 ? 'Register Now' : 'Event Full'}
                </Button>
              )}
            </>
          )}
          
          {isPastEvent && (
            <div className="text-center p-3 bg-gray-100 rounded-md">
              <p className="text-muted-foreground">This event has ended</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
