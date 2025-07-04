
import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { EventType, EventFormData, EventStatus } from '@/types/eventTypes';
import { getEventStatus } from '@/utils/eventUtils';

interface EventContextType {
  events: EventType[];
  isLoading: boolean;
  userRegistrations: string[];
  createEvent: (eventData: EventFormData) => Promise<void>;
  updateEvent: (id: string, eventData: Partial<EventFormData>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  registerForEvent: (eventId: string, userId: string) => Promise<void>;
  unregisterFromEvent: (eventId: string, userId: string) => Promise<void>;
  addEvent: (event: Omit<EventType, 'id' | 'registeredUsers'>) => Promise<void>;
  getEventStatus: (event: EventType) => EventStatus;
  refetchEvents: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // Fetch events with registration counts
  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (eventsError) throw eventsError;

      // Get registration counts for each event
      const eventsWithRegistrations: EventType[] = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { data: registrations, error: regError } = await supabase
            .from('event_registrations')
            .select('user_id')
            .eq('event_id', event.id);

          if (regError) {
            console.error('Error fetching registrations:', regError);
          }

          return {
            id: event.id,
            title: event.title,
            description: event.description || '',
            category: event.category as any,
            location: event.location,
            campus_type: event.campus_type as any,
            start_date: event.start_date,
            end_date: event.end_date,
            image_url: event.image_url || '',
            organizer: event.organizer,
            capacity: event.capacity,
            registeredUsers: registrations?.map(r => r.user_id).filter(Boolean) || []
          };
        })
      );

      return eventsWithRegistrations;
    },
  });

  // Fetch user registrations
  const { data: userRegistrations = [] } = useQuery({
    queryKey: ['userRegistrations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching user registrations:', error);
        return [];
      }
      
      return data?.map(r => r.event_id).filter(Boolean) || [];
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: EventFormData) => {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, eventData }: { id: string; eventData: Partial<EventFormData> }) => {
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to update event: ${error.message}`);
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete event: ${error.message}`);
    },
  });

  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: string; userId: string }) => {
      const { error } = await supabase
        .from('event_registrations')
        .insert([{ event_id: eventId, user_id: userId }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['userRegistrations'] });
      toast.success('Successfully registered for event!');
    },
    onError: (error: any) => {
      toast.error(`Failed to register: ${error.message}`);
    },
  });

  // Unregister from event mutation
  const unregisterMutation = useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: string; userId: string }) => {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['userRegistrations'] });
      toast.success('Successfully unregistered from event!');
    },
    onError: (error: any) => {
      toast.error(`Failed to unregister: ${error.message}`);
    },
  });

  const value: EventContextType = {
    events,
    isLoading,
    userRegistrations,
    createEvent: async (eventData: EventFormData) => {
      await createEventMutation.mutateAsync(eventData);
    },
    updateEvent: async (id: string, eventData: Partial<EventFormData>) => {
      await updateEventMutation.mutateAsync({ id, eventData });
    },
    deleteEvent: deleteEventMutation.mutateAsync,
    registerForEvent: async (eventId: string, userId: string) => {
      await registerMutation.mutateAsync({ eventId, userId });
    },
    unregisterFromEvent: async (eventId: string, userId: string) => {
      await unregisterMutation.mutateAsync({ eventId, userId });
    },
    addEvent: async (event: Omit<EventType, 'id' | 'registeredUsers'>) => {
      await createEventMutation.mutateAsync(event as EventFormData);
    },
    getEventStatus: (event: EventType) => getEventStatus(event),
    refetchEvents: refetch,
  };

  return (
    <EventContext.Provider value={value}>
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

// Export types for components to use
export type { EventType, EventFormData, EventStatus };
export { getEventStatus };
