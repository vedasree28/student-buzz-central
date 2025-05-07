
import { supabase } from "@/integrations/supabase/client";
import { EventType } from '@/types/eventTypes';
import { toast } from "sonner";

type UseEventOperationsProps = {
  events: EventType[];
  userRegistrations: string[];
  saveEvents: (updatedEvents: EventType[]) => void;
  saveUserRegistrations: (updatedRegistrations: string[]) => void;
};

export const useEventOperations = ({
  events,
  userRegistrations,
  saveEvents,
  saveUserRegistrations
}: UseEventOperationsProps) => {

  const addEvent = (event: Omit<EventType, 'id' | 'registeredUsers'>) => {
    // Try to add to Supabase first
    supabase
      .from('events')
      .insert([{
        ...event,
        registeredUsers: []
      }])
      .then(({ error }) => {
        if (error) {
          console.error('Error adding event to Supabase:', error);
          
          // Fallback: Add to local storage if Supabase fails
          const newEvent: EventType = {
            ...event,
            id: Date.now().toString(),
            registeredUsers: [],
          };
          const updatedEvents = [...events, newEvent];
          saveEvents(updatedEvents);
        }
        // Success is handled by the real-time subscription
        toast.success('Event added successfully!');
      });
  };

  const updateEvent = (
    id: string,
    updatedFields: Partial<Omit<EventType, 'id' | 'registeredUsers'>>
  ) => {
    // First update in Supabase
    supabase
      .from('events')
      .update(updatedFields)
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating event in Supabase:', error);
          
          // Fallback: Update in local storage if Supabase fails
          const updatedEvents = events.map((event) =>
            event.id === id ? { ...event, ...updatedFields } : event
          );
          saveEvents(updatedEvents);
        }
        // Success is handled by the real-time subscription
        toast.success('Event updated successfully!');
      });
  };

  const deleteEvent = (id: string) => {
    // First delete from Supabase
    supabase
      .from('events')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error deleting event from Supabase:', error);
          
          // Fallback: Delete from local storage if Supabase fails
          const updatedEvents = events.filter(event => event.id !== id);
          saveEvents(updatedEvents);
        }
        
        // Also remove from user registrations if present
        if (userRegistrations.includes(id)) {
          const updatedRegistrations = userRegistrations.filter(eventId => eventId !== id);
          saveUserRegistrations(updatedRegistrations);
        }
        
        // Success is handled by the real-time subscription
        toast.success('Event deleted successfully!');
      });
  };

  const registerForEvent = (eventId: string, userId: string) => {
    // Find the event to check capacity
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      toast.error('Event not found');
      return;
    }
    
    // Check if reached capacity
    if (event.registeredUsers.length >= event.capacity) {
      toast.error('This event has reached capacity');
      return;
    }
    
    // Don't add if already registered
    if (event.registeredUsers.includes(userId)) {
      toast.info('You are already registered for this event');
      return;
    }
    
    // First update in Supabase
    supabase
      .from('event_registrations')
      .insert([{ event_id: eventId, user_id: userId }])
      .then(({ error }) => {
        if (error) {
          console.error('Error registering for event in Supabase:', error);
          
          // Fallback: Update in local storage if Supabase fails
          const updatedEvents = events.map(event => {
            if (event.id === eventId) {
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
          }
        }
        
        toast.success('Registration successful!');
      });
  };

  const unregisterFromEvent = (eventId: string, userId: string) => {
    // First update in Supabase
    supabase
      .from('event_registrations')
      .delete()
      .match({ event_id: eventId, user_id: userId })
      .then(({ error }) => {
        if (error) {
          console.error('Error unregistering from event in Supabase:', error);
          
          // Fallback: Update in local storage if Supabase fails
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
        }
        
        // Also update user registrations
        const updatedRegistrations = userRegistrations.filter(id => id !== eventId);
        saveUserRegistrations(updatedRegistrations);
        
        toast.info('You have been unregistered from this event');
      });
  };

  return {
    addEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent
  };
};
