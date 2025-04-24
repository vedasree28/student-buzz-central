
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import EventCard from '@/components/EventCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Calendar, CalendarPlus } from 'lucide-react';

const UserDashboard = () => {
  const { events, userRegistrations, getEventStatus } = useEvents();
  const { user } = useAuth();
  
  // Filter events the user is registered for
  const registeredEvents = events.filter(event => userRegistrations.includes(event.id));
  
  // Filter upcoming registered events
  const upcomingRegisteredEvents = registeredEvents.filter(event => getEventStatus(event) === 'upcoming')
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  
  // Filter ongoing registered events
  const ongoingRegisteredEvents = registeredEvents.filter(event => getEventStatus(event) === 'ongoing')
    .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
  
  // Filter past registered events
  const pastRegisteredEvents = registeredEvents.filter(event => getEventStatus(event) === 'past')
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here's an overview of your registered events.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild>
            <Link to="/notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Link>
          </Button>
          <Button asChild>
            <Link to="/events">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Find Events
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Upcoming Events</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{upcomingRegisteredEvents.length}</p>
          <p className="text-sm text-muted-foreground">Events you're registered for</p>
        </div>
        
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Ongoing Events</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{ongoingRegisteredEvents.length}</p>
          <p className="text-sm text-muted-foreground">Events happening now</p>
        </div>
        
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Past Events</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{pastRegisteredEvents.length}</p>
          <p className="text-sm text-muted-foreground">Events you've attended</p>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold tracking-tight mb-6">Your Events</h2>
      
      {registeredEvents.length > 0 ? (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="ongoing">Happening Now</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-6">
            {upcomingRegisteredEvents.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingRegisteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">No upcoming events</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't registered for any upcoming events yet.
                </p>
                <Button asChild>
                  <Link to="/events">Browse Events</Link>
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ongoing" className="mt-6">
            {ongoingRegisteredEvents.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {ongoingRegisteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">No ongoing events</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any events happening right now.
                </p>
                <Button asChild>
                  <Link to="/events">Browse Events</Link>
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-6">
            {pastRegisteredEvents.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pastRegisteredEvents.map(event => (
                  <EventCard key={event.id} event={event} showActions={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">No past events</h3>
                <p className="text-muted-foreground mb-4">
                  Your past events history is empty.
                </p>
                <Button asChild>
                  <Link to="/events">Browse Events</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">No registered events</h3>
          <p className="text-muted-foreground mb-4">
            You haven't registered for any events yet. Browse events to find something interesting!
          </p>
          <Button asChild>
            <Link to="/events">Browse Events</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
