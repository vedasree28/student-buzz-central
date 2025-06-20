
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { EventType } from '@/types/eventTypes';
import { INITIAL_EVENTS, formatEventFromSupabase } from '@/utils/eventUtils';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';

export const useEventData = () => {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<EventType[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<string[]>([]);

  const saveEvents = (updatedEvents: EventType[]) => {
    setEvents(updatedEvents);
  };

  const saveUserRegistrations = (updatedRegistrations: string[]) => {
    setUserRegistrations(updatedRegistrations);
  };

  // Function to fetch events from Supabase
  const refreshEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching events:', error);
        // Fallback to initial events if Supabase fails
        setEvents(INITIAL_EVENTS);
        return;
      }
      
      if (data && data.length > 0) {
        const formattedEvents: EventType[] = data.map(formatEventFromSupabase);
        setEvents(formattedEvents);
        console.log('Fetched events from Supabase:', formattedEvents.length);
      } else {
        // Use initial events if no data in Supabase
        setEvents(INITIAL_EVENTS);
        console.log('No events found in Supabase, using initial data');
      }
    } catch (error) {
      console.error('Error in refreshEvents:', error);
      setEvents(INITIAL_EVENTS);
    }
  };

  // Function to fetch user registrations from Supabase
  const refreshUserRegistrations = async (userId: string) => {
    if (!userId || !isAuthenticated) {
      setUserRegistrations([]);
      return;
    }
    
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
        const registrationsArray = data.map(registration => registration.event_id).filter(Boolean);
        setUserRegistrations(registrationsArray);
        console.log('Fetched user registrations:', registrationsArray.length);
      } else {
        setUserRegistrations([]);
      }
    } catch (error) {
      console.error('Error in refreshUserRegistrations:', error);
      setUserRegistrations([]);
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
          refreshEvents(); // Refresh all events when any change occurs
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
          
          if (user?.id) {
            refreshUserRegistrations(user.id);
          }
          refreshEvents(); // Also refresh events to update registration counts
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(registrationsChannel);
    };
  }, []);

  // Fetch user registrations when user changes
  useEffect(() => {
    if (user?.id && isAuthenticated) {
      refreshUserRegistrations(user.id);
    } else {
      setUserRegistrations([]);
    }
  }, [user?.id, isAuthenticated]);

  return {
    events,
    userRegistrations,
    saveEvents,
    saveUserRegistrations,
    refreshEvents,
    refreshUserRegistrations
  };
};
