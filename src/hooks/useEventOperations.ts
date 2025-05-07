
import { supabase } from "@/integrations/supabase/client";
import { EventType } from '@/types/eventTypes';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  const addEvent = (event: Omit<EventType, 'id' | 'registeredUsers'>) => {
    try {
      // Add to Supabase - the real-time subscription will handle updating the UI
      supabase
        .from('events')
        .insert([{
          ...event,
          // Ensure we're not sending registeredUsers directly
        }])
        .then(({ error }) => {
          if (error) {
            console.error('Error adding event to Supabase:', error);
            toast.error('Failed to add event: ' + error.message);
            
            // Fallback: Add to local storage if Supabase fails
            const newEvent: EventType = {
              ...event,
              id: Date.now().toString(),
              registeredUsers: [],
            };
            const updatedEvents = [...events, newEvent];
            saveEvents(updatedEvents);
            toast.success('Event added locally (offline mode)');
          } else {
            // Success is handled by the real-time subscription
            toast.success('Event added successfully!');
          }
        });
    } catch (error) {
      console.error('Error in addEvent:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const updateEvent = (
    id: string,
    updatedFields: Partial<Omit<EventType, 'id' | 'registeredUsers'>>
  ) => {
    try {
      // First update in Supabase
      supabase
        .from('events')
        .update(updatedFields)
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating event in Supabase:', error);
            toast.error('Failed to update event: ' + error.message);
            
            // Fallback: Update in local storage if Supabase fails
            const updatedEvents = events.map((event) =>
              event.id === id ? { ...event, ...updatedFields } : event
            );
            saveEvents(updatedEvents);
            toast.success('Event updated locally (offline mode)');
          }
          // Success is handled by the real-time subscription
        });
    } catch (error) {
      console.error('Error in updateEvent:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const deleteEvent = (id: string) => {
    try {
      // First delete from Supabase
      supabase
        .from('events')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Error deleting event from Supabase:', error);
            toast.error('Failed to delete event: ' + error.message);
            
            // Fallback: Delete from local storage if Supabase fails
            const updatedEvents = events.filter(event => event.id !== id);
            saveEvents(updatedEvents);
            toast.success('Event deleted locally (offline mode)');
          }
          
          // Also remove from user registrations if present
          if (userRegistrations.includes(id)) {
            const updatedRegistrations = userRegistrations.filter(eventId => eventId !== id);
            saveUserRegistrations(updatedRegistrations);
          }
          
          // Success is handled by the real-time subscription
        });
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const registerForEvent = (eventId: string, userId: string) => {
    try {
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
            toast.error('Failed to register for event: ' + error.message);
            
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
            
            toast.success('Registration recorded locally (offline mode)');
          }
        });
    } catch (error) {
      console.error('Error in registerForEvent:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const unregisterFromEvent = (eventId: string, userId: string) => {
    try {
      // First update in Supabase
      supabase
        .from('event_registrations')
        .delete()
        .match({ event_id: eventId, user_id: userId })
        .then(({ error }) => {
          if (error) {
            console.error('Error unregistering from event in Supabase:', error);
            toast.error('Failed to unregister from event: ' + error.message);
            
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
            toast.info('Registration removed locally (offline mode)');
          }
          
          // Also update user registrations
          const updatedRegistrations = userRegistrations.filter(id => id !== eventId);
          saveUserRegistrations(updatedRegistrations);
        });
    } catch (error) {
      console.error('Error in unregisterFromEvent:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return {
    addEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent
  };
};
