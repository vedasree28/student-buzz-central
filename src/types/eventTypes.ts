
export type EventCategory = 'academic' | 'social' | 'career' | 'sports' | 'arts' | 'other';
export type EventStatus = 'upcoming' | 'ongoing' | 'past';
export type CampusType = 'on' | 'off';

export type EventType = {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  campus_type: CampusType;
  start_date: string;
  end_date: string;
  image_url: string;
  organizer: string;
  capacity: number;
  registeredUsers: string[]; // array of user IDs
};

export type EventContextType = {
  events: EventType[];
  userRegistrations: string[]; // array of event IDs the current user is registered for
  addEvent: (event: Omit<EventType, 'id' | 'registeredUsers'>) => void;
  updateEvent: (id: string, event: Partial<Omit<EventType, 'id' | 'registeredUsers'>>) => void;
  deleteEvent: (id: string) => void;
  registerForEvent: (eventId: string, userId: string) => void;
  unregisterFromEvent: (eventId: string, userId: string) => void;
  getEventStatus: (event: EventType) => EventStatus;
  refreshEvents: () => Promise<void>;
};
