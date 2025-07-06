
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '@/components/EventCard';
import { useEvents } from '@/contexts/EventContext';
import { Button } from "@/components/ui/button";
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Home = () => {
  const { events, getEventStatus, isLoading } = useEvents();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('Home component - events changed:', events);
    console.log('Home component - isLoading:', isLoading);
    
    if (!events || events.length === 0) {
      console.log('No events available for categorization');
      setUpcomingEvents([]);
      setOngoingEvents([]);
      setPastEvents([]);
      return;
    }

    const now = new Date();
    console.log('Current time for comparison:', now);

    const upcoming = events
      .filter(event => {
        try {
          const startDate = new Date(event.start_date);
          const isUpcoming = startDate > now;
          console.log(`Event "${event.title}": start=${event.start_date}, isUpcoming=${isUpcoming}`);
          return isUpcoming;
        } catch (e) {
          console.error("Error parsing start date:", event.start_date, e);
          return false;
        }
      })
      .sort((a, b) => {
        try {
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        } catch (e) {
          console.error("Error sorting dates:", e);
          return 0;
        }
      });

    const ongoing = events
      .filter(event => {
        try {
          const start = new Date(event.start_date);
          const end = new Date(event.end_date);
          const isOngoing = start <= now && end >= now;
          console.log(`Event "${event.title}": start=${event.start_date}, end=${event.end_date}, isOngoing=${isOngoing}`);
          return isOngoing;
        } catch (e) {
          console.error("Error parsing dates for ongoing events:", e);
          return false;
        }
      })
      .sort((a, b) => {
        try {
          return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        } catch (e) {
          return 0;
        }
      });

    const past = events
      .filter(event => {
        try {
          const endDate = new Date(event.end_date);
          const isPast = endDate < now;
          console.log(`Event "${event.title}": end=${event.end_date}, isPast=${isPast}`);
          return isPast;
        } catch (e) {
          console.error("Error parsing end date:", event.end_date, e);
          return false;
        }
      })
      .sort((a, b) => {
        try {
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        } catch (e) {
          return 0;
        }
      });

    console.log('Categorized events:', {
      upcoming: upcoming.length,
      ongoing: ongoing.length,
      past: past.length
    });

    setUpcomingEvents(upcoming);
    setOngoingEvents(ongoing);
    setPastEvents(past);
  }, [events, isLoading]);

  // Subscribe to real-time events changes
  useEffect(() => {
    const channel = supabase
      .channel('public:events')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' }, 
        (payload) => {
          console.log('Real-time event update:', payload);
          toast.info("Event information updated");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Subscribe to real-time registration changes
  useEffect(() => {
    const channel = supabase
      .channel('public:event_registrations')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'event_registrations' }, 
        (payload) => {
          console.log('Real-time registration update:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero / Welcome Section */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-blue-600">Discover</span> Campus Events Effortlessly
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Stay informed, register for events, and never miss out on campus buzz again. Whether academic, social, or career—there's something for everyone!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {!isAuthenticated && (
                <>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button size="lg" asChild>
                    <Link to="/register">Create Account</Link>
                  </Button>
                  <GoogleSignInButton />
                </>
              )}
            </div>
          </div>
          <img
            src="/lovable-uploads/7bc18243-e04c-4f91-9fc4-21aba9afdb6a.png"
            alt="Campus Events"
            className="w-[380px] rounded-xl border shadow"
            onError={(e) => {
              // Fallback to placeholder if the image fails to load
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-8">
        <div className="container">
          <h2 className="text-3xl font-bold mb-6">Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">No upcoming events</h3>
              <p className="text-muted-foreground mb-4">
                Stay tuned! New events are added regularly.
              </p>
              <Button asChild>
                <Link to="/events">Explore All Events</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Ongoing Events Section */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold mb-6">Happening Now</h2>
          {ongoingEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ongoingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">No ongoing events</h3>
              <p className="text-muted-foreground mb-4">
                Check back later to see what's happening live!
              </p>
              <Button asChild>
                <Link to="/events">Explore All Events</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Past Events Section */}
      <section className="py-8">
        <div className="container">
          <h2 className="text-3xl font-bold mb-6">Past Events</h2>
          {pastEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map(event => (
                <EventCard key={event.id} event={event} showActions={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">No past events</h3>
              <p className="text-muted-foreground mb-4">
                Looks like you haven't attended any events yet.
              </p>
              <Button asChild>
                <Link to="/events">Explore All Events</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
