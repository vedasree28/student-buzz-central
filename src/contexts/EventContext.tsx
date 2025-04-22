
import React, { createContext, useContext, useState } from 'react';
import { toast } from "sonner";

export type EventCategory = 'academic' | 'social' | 'career' | 'sports' | 'arts' | 'other';

export type EventStatus = 'upcoming' | 'ongoing' | 'past';

export type EventType = {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  organizer: string;
  capacity: number;
  registeredUsers: string[]; // array of user IDs
};

type EventContextType = {
  events: EventType[];
  userRegistrations: string[]; // array of event IDs the current user is registered for
  addEvent: (event: Omit<EventType, 'id' | 'registeredUsers'>) => void;
  updateEvent: (id: string, event: Partial<Omit<EventType, 'id' | 'registeredUsers'>>) => void;
  deleteEvent: (id: string) => void;
  registerForEvent: (eventId: string, userId: string) => void;
  unregisterFromEvent: (eventId: string, userId: string) => void;
  getEventStatus: (event: EventType) => EventStatus;
};

// Sample event data
const INITIAL_EVENTS: EventType[] = [
  {
    id: '1',
    title: 'Freshman Orientation',
    description: 'Welcome event for new students to get familiar with campus resources, meet faculty, and connect with peers.',
    category: 'academic',
    location: 'Main Auditorium',
    startDate: '2025-06-10T09:00:00Z',
    endDate: '2025-06-10T14:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    organizer: 'Student Affairs Office',
    capacity: 300,
    registeredUsers: ['2'],
  },
  {
    id: '2',
    title: 'Career Fair',
    description: 'Annual career fair with representatives from top companies across various industries.',
    category: 'career',
    location: 'University Center',
    startDate: '2025-05-15T10:00:00Z',
    endDate: '2025-05-15T16:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    organizer: 'Career Services',
    capacity: 500,
    registeredUsers: [],
  },
  {
    id: '3',
    title: 'Spring Concert',
    description: 'Annual spring concert featuring popular artists and student performances.',
    category: 'arts',
    location: 'Campus Stadium',
    startDate: '2025-04-20T18:00:00Z',
    endDate: '2025-04-20T22:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b',
    organizer: 'Student Activities Board',
    capacity: 2000,
    registeredUsers: [],
  },
  {
    id: '4',
    title: 'Hackathon',
    description: '48-hour event where students collaborate on innovative tech projects and compete for prizes.',
    category: 'academic',
    location: 'Technology Building',
    startDate: '2025-03-05T17:00:00Z',
    endDate: '2025-03-07T17:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    organizer: 'Computer Science Department',
    capacity: 150,
    registeredUsers: ['2'],
  },
];

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<EventType[]>(() => {
    // Try to load from localStorage first
    const savedEvents = localStorage.getItem('events');
    return savedEvents ? JSON.parse(savedEvents) : INITIAL_EVENTS;
  });
  
  const [userRegistrations, setUserRegistrations] = useState<string[]>(() => {
    // Try to load from localStorage first
    const savedRegistrations = localStorage.getItem('userRegistrations');
    return savedRegistrations ? JSON.parse(savedRegistrations) : ['1', '4'];
  });

  const saveEvents = (updatedEvents: EventType[]) => {
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
  };

  const saveUserRegistrations = (updatedRegistrations: string[]) => {
    setUserRegistrations(updatedRegistrations);
    localStorage.setItem('userRegistrations', JSON.stringify(updatedRegistrations));
  };

  const addEvent = (event: Omit<EventType, 'id' | 'registeredUsers'>) => {
    const newEvent: EventType = {
      ...event,
      id: Date.now().toString(),
      registeredUsers: [],
    };
    
    const updatedEvents = [...events, newEvent];
    saveEvents(updatedEvents);
    toast.success('Event added successfully!');
  };

  const updateEvent = (id: string, updatedFields: Partial<Omit<EventType, 'id' | 'registeredUsers'>>) => {
    const updatedEvents = events.map(event => 
      event.id === id 
        ? { ...event, ...updatedFields } 
        : event
    );
    
    saveEvents(updatedEvents);
    toast.success('Event updated successfully!');
  };

  const deleteEvent = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id);
    saveEvents(updatedEvents);
    
    // Also remove from user registrations if present
    if (userRegistrations.includes(id)) {
      const updatedRegistrations = userRegistrations.filter(eventId => eventId !== id);
      saveUserRegistrations(updatedRegistrations);
    }
    
    toast.success('Event deleted successfully!');
  };

  const registerForEvent = (eventId: string, userId: string) => {
    // Update the event's registeredUsers
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        // Check if reached capacity
        if (event.registeredUsers.length >= event.capacity) {
          toast.error('This event has reached capacity');
          return event;
        }
        
        // Don't add if already registered
        if (event.registeredUsers.includes(userId)) {
          toast.info('You are already registered for this event');
          return event;
        }
        
        return {
          ...event,
          registeredUsers: [...event.registeredUsers, userId],
        };
      }
      return event;
    });
    
    saveEvents(updatedEvents);
    
    // Also update user registrations
    if (!userRegistrations.includes(eventId)) {
      const updatedRegistrations = [...userRegistrations, eventId];
      saveUserRegistrations(updatedRegistrations);
      toast.success('Registration successful!');
    }
  };

  const unregisterFromEvent = (eventId: string, userId: string) => {
    // Update the event's registeredUsers
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          registeredUsers: event.registeredUsers.filter(id => id !== userId),
        };
      }
      return event;
    });
    
    saveEvents(updatedEvents);
    
    // Also update user registrations
    const updatedRegistrations = userRegistrations.filter(id => id !== eventId);
    saveUserRegistrations(updatedRegistrations);
    toast.info('You have been unregistered from this event');
  };

  const getEventStatus = (event: EventType): EventStatus => {
    const now = new Date().getTime();
    const startTime = new Date(event.startDate).getTime();
    const endTime = new Date(event.endDate).getTime();
    
    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'past';
    return 'ongoing';
  };

  return (
    <EventContext.Provider
      value={{
        events,
        userRegistrations,
        addEvent,
        updateEvent,
        deleteEvent,
        registerForEvent,
        unregisterFromEvent,
        getEventStatus,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  
  return context;
};
