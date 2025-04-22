
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEvents, EventCategory, EventStatus } from '@/contexts/EventContext';
import EventCard from '@/components/EventCard';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Events = () => {
  const { events, getEventStatus } = useEvents();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<EventCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  
  const filteredEvents = events.filter(event => {
    const eventStatus = getEventStatus(event);
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || event.category === category;
    const matchesStatus = statusFilter === 'all' || eventStatus === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const upcomingEvents = filteredEvents.filter(event => getEventStatus(event) === 'upcoming')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
  const ongoingEvents = filteredEvents.filter(event => getEventStatus(event) === 'ongoing')
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  
  const pastEvents = filteredEvents.filter(event => getEventStatus(event) === 'past')
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  
  const categories: { value: EventCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'academic', label: 'Academic' },
    { value: 'social', label: 'Social' },
    { value: 'career', label: 'Career' },
    { value: 'sports', label: 'Sports' },
    { value: 'arts', label: 'Arts' },
    { value: 'other', label: 'Other' },
  ];
  
  const statuses: { value: EventStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Events' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Happening Now' },
    { value: 'past', label: 'Past Events' },
  ];
  
  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Campus Events</h1>
          <p className="text-muted-foreground">Discover and register for events happening on campus</p>
        </div>
        
        {isAdmin && (
          <Button asChild>
            <Link to="/events/new">
              <Plus className="mr-2 h-4 w-4" /> Add New Event
            </Link>
          </Button>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] mb-8">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={category} onValueChange={(value) => setCategory(value as EventCategory | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as EventStatus | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Happening Now</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No upcoming events found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms to find events.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ongoing" className="mt-6">
          {ongoingEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ongoingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No ongoing events found</h3>
              <p className="text-muted-foreground mb-4">
                There are currently no events happening right now that match your filters.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          {pastEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No past events found</h3>
              <p className="text-muted-foreground mb-4">
                There are no past events that match your current filters.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Events;
