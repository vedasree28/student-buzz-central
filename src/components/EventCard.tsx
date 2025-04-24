
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Home, MapPinOff } from 'lucide-react';
import { EventType, EventStatus, useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface EventCardProps {
  event: EventType;
  showActions?: boolean;
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

const EventCard = ({ event, showActions = true }: EventCardProps) => {
  const { user } = useAuth();
  const { getEventStatus, registerForEvent, unregisterFromEvent, userRegistrations } = useEvents();
  
  // Explicitly type the status to ensure type safety
  const status: EventStatus = getEventStatus(event);
  const isRegistered = userRegistrations.includes(event.id);
  
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
    if (!user) return;
    
    if (isRegistered) {
      unregisterFromEvent(event.id, user.id);
    } else {
      registerForEvent(event.id, user.id);
    }
  };

  return (
    <div className="event-card flex flex-col h-full">
      <div className="relative h-48 w-full">
        <img 
          src={event.imageUrl} 
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
          {getCampusTypeBadge(event.campusType)}
        </div>
      </div>
      
      <div className="flex-1 p-4 flex flex-col">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{event.title}</h3>
        
        <div className="space-y-2 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          
          {status !== 'past' && (
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>
                {status === 'ongoing'
                  ? `Ends ${format(new Date(event.endDate), 'h:mm a')}`
                  : `Duration ${format(new Date(event.startDate), 'h:mm a')} - ${format(new Date(event.endDate), 'h:mm a')}`}
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
          
          {showActions && user && status !== 'past' && (
            <Button 
              variant={isRegistered ? "destructive" : "default"}
              className="flex-1"
              onClick={handleRegistration}
              disabled={status === 'past'}
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
