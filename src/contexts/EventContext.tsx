
import React, { createContext, useContext, useEffect } from 'react';
import { EventType, EventContextType } from '@/types/eventTypes';
import { useEventData } from '@/hooks/useEventData';
import { useEventOperations } from '@/hooks/useEventOperations';
import { getEventStatus } from '@/utils/eventUtils';
import { useAuth } from '@/contexts/AuthContext';

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const {
    events,
    userRegistrations,
    saveEvents,
    saveUserRegistrations,
    refreshEvents,
    refreshUserRegistrations
  } = useEventData();

  const {
    addEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent
  } = useEventOperations({
    events,
    userRegistrations,
    saveEvents,
    saveUserRegistrations
  });

  // Fetch user-specific registrations whenever the user changes
  useEffect(() => {
    if (user) {
      refreshUserRegistrations(user.id);
    }
  }, [user]);

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
        refreshEvents,
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

// Re-export types for easier imports elsewhere
export type { EventType, EventCategory, EventStatus, CampusType } from '@/types/eventTypes';
