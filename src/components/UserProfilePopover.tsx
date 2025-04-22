
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/contexts/EventContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Mail, User } from "lucide-react";
import { Link } from "react-router-dom";

const UserProfilePopover = () => {
  const { user } = useAuth();
  const { events, userRegistrations } = useEvents();

  const registeredEvents = events.filter(event =>
    userRegistrations.includes(event.id)
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
            <User className="h-5 w-5 text-purple-600" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{user?.email ?? "-"}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
            <User className="h-4 w-4" />
            {user?.name}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-sm text-gray-700">
            Registered Events
          </h4>
          {registeredEvents.length > 0 ? (
            <ul className="space-y-1 max-h-32 overflow-y-auto">
              {registeredEvents.map(ev => (
                <li key={ev.id} className="truncate">
                  <Link to={`/events/${ev.id}`} className="hover:underline text-blue-700 text-xs">
                    {ev.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No events registered.</p>
          )}
        </div>
        <div className="mt-4 text-right">
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserProfilePopover;
