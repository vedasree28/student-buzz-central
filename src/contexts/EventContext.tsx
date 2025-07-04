
import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Event, EventFormData } from '@/types/eventTypes';

interface EventContextType {
  events: Event[];
  isLoading: boolean;
  createEvent: (eventData: EventFormData) => Promise<void>;
  updateEvent: (id: string, eventData: Partial<EventFormData>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  registerForEvent: (eventId: string) => Promise<void>;
  unregisterFromEvent: (eventId: string) => Promise<void>;
  refetchEvents: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // Fetch events
  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data as Event[];
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
    mutationFn: async (eventId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('event_registrations')
        .insert([{ event_id: eventId, user_id: user.id }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Successfully registered for event!');
    },
    onError: (error: any) => {
      toast.error(`Failed to register: ${error.message}`);
    },
  });

  // Unregister from event mutation
  const unregisterMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Successfully unregistered from event!');
    },
    onError: (error: any) => {
      toast.error(`Failed to unregister: ${error.message}`);
    },
  });

  const value: EventContextType = {
    events,
    isLoading,
    createEvent: createEventMutation.mutateAsync,
    updateEvent: (id: string, eventData: Partial<EventFormData>) =>
      updateEventMutation.mutateAsync({ id, eventData }),
    deleteEvent: deleteEventMutation.mutateAsync,
    registerForEvent: registerMutation.mutateAsync,
    unregisterFromEvent: unregisterMutation.mutateAsync,
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
