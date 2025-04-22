
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useEvents, EventCategory } from '@/contexts/EventContext';
import EventCard from '@/components/EventCard';
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
import GoogleSignInButton from '@/components/GoogleSignInButton'; // Added import

const Home = () => {
  const { events, getEventStatus } = useEvents();
  const [category, setCategory] = useState<EventCategory | 'all'>('all');

  const upcomingEvents = events
    .filter(event => {
      const status = getEventStatus(event);
      const categoryMatch = category === 'all' || event.category === category;
      return status === 'upcoming' && categoryMatch;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 6);

  const ongoingEvents = events
    .filter(event => {
      const status = getEventStatus(event);
      const categoryMatch = category === 'all' || event.category === category;
      return status === 'ongoing' && categoryMatch;
    });

  const featuredEvents = events
    .filter(event => getEventStatus(event) !== 'past')
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const categories: { value: EventCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'academic', label: 'Academic' },
    { value: 'social', label: 'Social' },
    { value: 'career', label: 'Career' },
    { value: 'sports', label: 'Sports' },
    { value: 'arts', label: 'Arts' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Never Miss a Campus Event Again
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Stay up-to-date with all campus activities, get notified about events you're interested in, and manage your event calendar in one place.
                </p>
              </div>
              {/* Button Row with Google Sign In */}
              <div className="flex flex-col gap-2 min-[400px]:flex-row items-center">
                <Button size="lg" asChild>
                  <Link to="/events">Browse Events</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/register">Create Account</Link>
                </Button>
                {/* Google Sign In Button */}
                <div>
                  <GoogleSignInButton />
                </div>
              </div>
            </div>
            <img
              alt="Campus events"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
            />
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Events</h2>
              <p className="text-muted-foreground">Spotlight on special campus activities</p>
            </div>
            <Button asChild>
              <Link to="/events">View All Events</Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Events Tabs Section */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Events Calendar</h2>
              <p className="text-muted-foreground">Browse upcoming and ongoing campus events</p>
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
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto md:grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="ongoing">Happening Now</TabsTrigger>
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
                  <h3 className="text-lg font-medium mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground mb-4">
                    There are no upcoming events in this category at the moment.
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
                  <h3 className="text-lg font-medium mb-2">No ongoing events</h3>
                  <p className="text-muted-foreground mb-4">
                    There are no events happening right now in this category.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 bg-blue-600 text-white">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Stay Updated with Campus Events</h2>
          <p className="max-w-[700px] mx-auto mb-8 text-blue-100">
            Create an account to get personalized event recommendations, register for events, and receive notifications about upcoming activities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-700" asChild>
              <Link to="/events">Browse Events</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

