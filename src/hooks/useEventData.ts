
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { EventType } from '@/types/eventTypes';
import { INITIAL_EVENTS, formatEventFromSupabase } from '@/utils/eventUtils';
import { toast } from "sonner";

export const useEventData = () => {
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

  // Function to fetch events from Supabase
  const refreshEvents = async () => {
    try {
      // First try to fetch from Supabase
      const { data, error } = await supabase
        .from('events')
        .select('*');
      
      if (error) {
        console.error('Error fetching events:', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Convert Supabase data to match our EventType structure
        const formattedEvents: EventType[] = data.map(formatEventFromSupabase);
        
        saveEvents(formattedEvents);
        console.log('Fetched events from Supabase:', formattedEvents);
      } else {
        console.log('No events found in Supabase, using initial or localStorage data');
      }
    } catch (error) {
      console.error('Error in refreshEvents:', error);
    }
  };

  // Function to fetch user registrations from Supabase
  const refreshUserRegistrations = async (userId: string) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user registrations:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const registrationsArray = data.map(registration => registration.event_id);
        saveUserRegistrations(registrationsArray);
        console.log('Fetched user registrations:', registrationsArray);
      }
    } catch (error) {
      console.error('Error in refreshUserRegistrations:', error);
    }
  };

  // Set up real-time subscription for events changes
  useEffect(() => {
    refreshEvents();
    
    // Subscribe to real-time updates for events
    const eventsChannel = supabase
      .channel('events_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' }, 
        (payload) => {
          console.log('Real-time event update:', payload);
          
          // Handle different types of events
          if (payload.eventType === 'INSERT') {
            const newEvent = formatEventFromSupabase(payload.new);
            setEvents(currentEvents => [...currentEvents, newEvent]);
            toast.info(`New event added: ${newEvent.title}`);
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedEvent = formatEventFromSupabase(payload.new);
            setEvents(currentEvents => 
              currentEvents.map(event => event.id === updatedEvent.id ? updatedEvent : event)
            );
            toast.info(`Event updated: ${updatedEvent.title}`);
          } 
          else if (payload.eventType === 'DELETE') {
            const deletedEventId = payload.old.id;
            setEvents(currentEvents => 
              currentEvents.filter(event => event.id !== deletedEventId)
            );
            toast.info("An event has been removed");
          }
        }
      )
      .subscribe();

    // Subscribe to real-time updates for event registrations
    const registrationsChannel = supabase
      .channel('registrations_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'event_registrations' },
        (payload) => {
          console.log('Real-time registration update:', payload);
          
          // Refresh events to get updated registration counts
          refreshEvents();
          
          if (payload.eventType === 'INSERT') {
            toast.success("New registration recorded");
          } else if (payload.eventType === 'DELETE') {
            toast.info("Registration removed");
          }
        }
      )
      .subscribe();

    return () => {
      // Clean up subscriptions
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(registrationsChannel);
    };
  }, []);

  return {
    events,
    userRegistrations,
    saveEvents,
    saveUserRegistrations,
    refreshEvents,
    refreshUserRegistrations
  };
};
