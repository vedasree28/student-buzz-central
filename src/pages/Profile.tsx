
import { useEvents } from "@/contexts/EventContext";
import { useAuth } from "@/contexts/AuthContext";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Profile = () => {
  const { events, userRegistrations, getEventStatus } = useEvents();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-3">Profile</h1>
          <p className="mb-4">You must be logged in to view your profile.</p>
          <Button asChild>
            <Link to="/login">Log in</Link>
          </Button>
        </div>
      </div>
    );
  }

  const registeredEvents = events.filter(ev =>
    userRegistrations.includes(ev.id)
  );

  const upcomingEvents = registeredEvents
    .filter(event => getEventStatus(event) === "upcoming")
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const ongoingEvents = registeredEvents
    .filter(event => getEventStatus(event) === "ongoing")
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

  const pastEvents = registeredEvents
    .filter(event => getEventStatus(event) === "past")
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <div className="mb-8 border rounded-lg p-4 max-w-lg">
        <div className="font-medium text-lg">{user.name}</div>
        <div className="text-gray-500 text-sm">{user.email}</div>
      </div>
      <h2 className="text-2xl font-bold mb-4">Your Registered Events</h2>
      {registeredEvents.length === 0 && (
        <div className="text-center py-8 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">No registered events</h3>
          <p className="text-muted-foreground mb-4">
            You haven't registered for any events yet.
          </p>
          <Button asChild>
            <Link to="/events">Browse Events</Link>
          </Button>
        </div>
      )}
      {upcomingEvents.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Upcoming Events</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
      {ongoingEvents.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Happening Now</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ongoingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
      {pastEvents.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Past Events</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} showActions={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Profile;
