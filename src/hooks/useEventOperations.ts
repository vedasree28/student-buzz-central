
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
  const { user, isAuthenticated } = useAuth();

  const addEvent = async (event: Omit<EventType, 'id' | 'registeredUsers'>) => {
    if (!isAuthenticated || !user) {
      toast.error('You must be logged in to create events');
      return;
    }

    if (user.role !== 'admin') {
      toast.error('Only administrators can create events');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([event])
        .select()
        .single();

      if (error) {
        console.error('Error adding event:', error);
        toast.error('Failed to add event: ' + error.message);
        return;
      }

      toast.success('Event added successfully!');
    } catch (error) {
      console.error('Error in addEvent:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const updateEvent = async (
    id: string,
    updatedFields: Partial<Omit<EventType, 'id' | 'registeredUsers'>>
  ) => {
    if (!isAuthenticated || !user) {
      toast.error('You must be logged in to update events');
      return;
    }

    if (user.role !== 'admin') {
      toast.error('Only administrators can update events');
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .update(updatedFields)
        .eq('id', id);

      if (error) {
        console.error('Error updating event:', error);
        toast.error('Failed to update event: ' + error.message);
        return;
      }

      toast.success('Event updated successfully!');
    } catch (error) {
      console.error('Error in updateEvent:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const deleteEvent = async (id: string) => {
    if (!isAuthenticated || !user) {
      toast.error('You must be logged in to delete events');
      return;
    }

    if (user.role !== 'admin') {
      toast.error('Only administrators can delete events');
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event: ' + error.message);
        return;
      }

      toast.success('Event deleted successfully!');
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const registerForEvent = async (eventId: string, userId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('You must be logged in to register for events');
      return;
    }

    try {
      // Check if already registered
      const { data: existingRegistration, error: checkError } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking registration:', checkError);
        toast.error('Failed to check registration status');
        return;
      }

      if (existingRegistration) {
        toast.info('You are already registered for this event');
        return;
      }

      // Register for the event
      const { error } = await supabase
        .from('event_registrations')
        .insert([{ event_id: eventId, user_id: userId }]);

      if (error) {
        console.error('Error registering for event:', error);
        toast.error('Failed to register for event: ' + error.message);
        return;
      }

      toast.success('Successfully registered for event!');
    } catch (error) {
      console.error('Error in registerForEvent:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const unregisterFromEvent = async (eventId: string, userId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('You must be logged in to unregister from events');
      return;
    }

    try {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error unregistering from event:', error);
        toast.error('Failed to unregister from event: ' + error.message);
        return;
      }

      toast.success('Successfully unregistered from event!');
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
