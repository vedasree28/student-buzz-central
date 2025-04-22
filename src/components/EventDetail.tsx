
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User,
  ArrowLeft,
  Edit,
  Trash2
} from 'lucide-react';
import { useEvents, EventType } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    events, 
    getEventStatus, 
    registerForEvent, 
    unregisterFromEvent, 
    userRegistrations,
    deleteEvent 
  } = useEvents();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const event = events.find(e => e.id === id);
  
  if (!event) {
    return (
      <div className="container max-w-4xl py-12 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }
  
  const status = getEventStatus(event);
  const isRegistered = userRegistrations.includes(event.id);
  const isAdmin = user?.role === 'admin';
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
  };
  
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'past':
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-purple-100 text-purple-800';
      case 'social':
        return 'bg-pink-100 text-pink-800';
      case 'career':
        return 'bg-blue-100 text-blue-800';
      case 'sports':
        return 'bg-green-100 text-green-800';
      case 'arts':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleRegistration = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (isRegistered) {
      unregisterFromEvent(event.id, user.id);
    } else {
      registerForEvent(event.id, user.id);
    }
  };
  
  const handleDelete = () => {
    deleteEvent(event.id);
    navigate('/events');
  };
  
  return (
    <div className="container max-w-4xl py-6 md:py-12">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Badge className={getStatusColor(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            <Badge className={getCategoryColor(event.category)}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Badge>
          </div>
          
          <h1 className="heading-1 mb-6">{event.title}</h1>
          
          <div className="rounded-lg overflow-hidden mb-6">
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-[300px] object-cover"
            />
          </div>
          
          <div className="prose max-w-none">
            <h2 className="heading-3 mb-4">About this event</h2>
            <p className="mb-6">{event.description}</p>
          </div>
          
          {isAdmin && (
            <div className="mt-8 flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate(`/events/${event.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" /> Edit Event
              </Button>
              
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Event
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the event
                      and remove it from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
        
        <div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="font-semibold mb-4">Event Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(event.startDate)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <User className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Organizer</p>
                  <p className="text-sm text-muted-foreground">{event.organizer}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Capacity</p>
                  <p className="text-sm text-muted-foreground">
                    {event.registeredUsers.length} / {event.capacity} registered
                  </p>
                </div>
              </div>
            </div>
            
            {user && status !== 'past' && (
              <Button 
                className="w-full mt-6"
                variant={isRegistered ? "destructive" : "default"}
                onClick={handleRegistration}
              >
                {isRegistered ? 'Cancel Registration' : 'Register for this Event'}
              </Button>
            )}
            
            {!user && (
              <Button 
                className="w-full mt-6"
                onClick={() => navigate('/login')}
              >
                Log in to Register
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
