
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

  // User's registered events
  const registeredEvents = events.filter(ev =>
    userRegistrations.includes(ev.id)
  );

  // Separate into On Campus and Off Campus
  const onCampusEvents = registeredEvents.filter(ev => ev.campus_type === "on");
  const offCampusEvents = registeredEvents.filter(ev => ev.campus_type === "off");

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

      {/* On Campus Events Section */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-2">On Campus Events</h3>
        {onCampusEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {onCampusEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground px-4 py-8 border rounded">
            No On Campus events registered for.
          </div>
        )}
      </section>

      {/* Off Campus Events Section */}
      <section className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Off Campus Events</h3>
        {offCampusEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offCampusEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground px-4 py-8 border rounded">
            No Off Campus events registered for.
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
