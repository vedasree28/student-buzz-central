import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Home, MapPinOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from 'react';

export type EventStatus = 'upcoming' | 'ongoing' | 'past';

interface EventType {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  campus_type: "on" | "off";
  start_date: string;
  end_date: string;
  image_url: string;
  organizer: string;
  capacity: number;
}

interface EventCardProps {
  event: EventType;
  showActions?: boolean;
  onRegistrationChange?: () => void;
}

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

const EventCard = ({ event, showActions = true, onRegistrationChange }: EventCardProps) => {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const getEventStatus = (event: EventType): EventStatus => {
    const now = new Date().getTime();
    const startTime = new Date(event.start_date).getTime();
    const endTime = new Date(event.end_date).getTime();
    
    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'past';
    return 'ongoing';
  };
  
  // Check if user is registered for this event
  useEffect(() => {
    checkRegistration();
  }, [user, event.id]);
  
  const checkRegistration = async () => {
    if (!user) {
      setIsRegistered(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .single();
      
      setIsRegistered(!!data);
    } catch (error) {
      console.error('Error checking registration:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegistration = async () => {
    if (!user) {
      toast.error('Please log in to register for events');
      return;
    }
    
    try {
      if (isRegistered) {
        await supabase
          .from('event_registrations')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);
        
        toast.success('Successfully unregistered from event');
        setIsRegistered(false);
      } else {
        const { error } = await supabase
          .from('event_registrations')
          .insert([
            { event_id: event.id, user_id: user.id }
          ]);
        
        if (error) throw error;
        
        toast.success('Successfully registered for event');
        setIsRegistered(true);
      }
      
      onRegistrationChange?.();
    } catch (error) {
      console.error('Error managing registration:', error);
      toast.error('Failed to manage registration');
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
  };
  
  const getStatusColor = (status: EventStatus) => {
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
    switch (category.toLowerCase()) {
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

  const status = getEventStatus(event);

  return (
    <div className="event-card flex flex-col h-full">
      <div className="relative h-48 w-full">
        <img 
          src={event.image_url} 
          alt={event.title} 
          className="h-full w-full object-cover"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Badge variant="secondary" className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          <Badge variant="secondary" className={getCategoryColor(event.category)}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-2">
          {getCampusTypeBadge(event.campus_type)}
        </div>
      </div>
      
      <div className="flex-1 p-4 flex flex-col">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{event.title}</h3>
        
        <div className="space-y-2 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{formatDate(event.start_date)}</span>
          </div>
          
          {status !== 'past' && (
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>
                {status === 'ongoing'
                  ? `Ends ${format(new Date(event.end_date), 'h:mm a')}`
                  : `Duration ${format(new Date(event.start_date), 'h:mm a')} - ${format(new Date(event.end_date), 'h:mm a')}`}
              </span>
            </div>
          )}
          
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{event.location}</span>
          </div>
        </div>
        
        <p className="text-sm mb-4 flex-grow line-clamp-2">
          {event.description}
        </p>
        
        <div className="mt-auto flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild className="flex-1">
            <Link to={`/events/${event.id}`}>View Details</Link>
          </Button>
          
          {showActions && user && status !== 'past' && !isLoading && (
            <Button 
              variant={isRegistered ? "destructive" : "default"}
              className="flex-1"
              onClick={handleRegistration}
              disabled={isLoading}
            >
              {isRegistered ? "Cancel Registration" : "Register"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
