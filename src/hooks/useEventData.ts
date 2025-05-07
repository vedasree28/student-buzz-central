
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

  // Set up real-time subscription for events changes
  useEffect(() => {
    refreshEvents();
    
    const channel = supabase
      .channel('public:events')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' }, 
        (payload) => {
          console.log('Real-time event update:', payload);
          refreshEvents(); // Refresh all events when any change occurs
          toast.info("Event information updated");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    events,
    setEvents,
    userRegistrations,
    setUserRegistrations,
    saveEvents,
    saveUserRegistrations,
    refreshEvents
  };
};
