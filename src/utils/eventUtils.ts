
import { EventType, EventStatus } from '@/types/eventTypes';
import { supabase } from '@/integrations/supabase/client';

// Sample event data
export const INITIAL_EVENTS: EventType[] = [
  {
    id: '1',
    title: 'Freshman Orientation',
    description: 'Welcome event for new students to get familiar with campus resources, meet faculty, and connect with peers.',
    category: 'academic',
    location: 'Main Auditorium',
    campus_type: 'on',
    start_date: '2025-06-10T09:00:00Z',
    end_date: '2025-06-10T14:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
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
    campus_type: 'on',
    start_date: '2025-05-15T10:00:00Z',
    end_date: '2025-05-15T16:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
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
    campus_type: 'off',
    start_date: '2025-04-20T18:00:00Z',
    end_date: '2025-04-20T22:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b',
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
    campus_type: 'on',
    start_date: '2025-03-05T17:00:00Z',
    end_date: '2025-03-07T17:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    organizer: 'Computer Science Department',
    capacity: 150,
    registeredUsers: ['2'],
  },
];

export const getEventStatus = (event: EventType): EventStatus => {
  const now = new Date().getTime();
  const startTime = new Date(event.start_date).getTime();
  const endTime = new Date(event.end_date).getTime();
  
  if (now < startTime) return 'upcoming';
  if (now > endTime) return 'past';
  return 'ongoing';
};

export const formatEventFromSupabase = (event: any): EventType => {
  // Get registration count from Supabase or use the registeredUsers array if it exists
  let registeredUsers: string[] = [];

  try {
    if (event.registeredUsers) {
      // If registeredUsers is already an array, use it
      if (Array.isArray(event.registeredUsers)) {
        registeredUsers = event.registeredUsers.map((id: any) => String(id));
      } 
      // If it's a JSON string, parse it
      else if (typeof event.registeredUsers === 'string') {
        try {
          registeredUsers = JSON.parse(event.registeredUsers);
        } catch (e) {
          console.error('Error parsing registeredUsers:', e);
        }
      }
    }
  } catch (error) {
    console.error('Error processing registeredUsers:', error);
  }
  
  return {
    id: String(event.id), // Ensure ID is a string
    title: event.title,
    description: event.description || '',
    category: event.category,
    location: event.location,
    campus_type: event.campus_type,
    start_date: event.start_date,
    end_date: event.end_date,
    image_url: event.image_url || '',
    organizer: event.organizer,
    capacity: event.capacity,
    registeredUsers: registeredUsers
  };
};

// Helper function to fetch registration count for an event
export const fetchEventRegistrationCount = async (eventId: string) => {
  try {
    const { data, error, count } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact' })
      .eq('event_id', eventId);
    
    if (error) {
      console.error('Error fetching registration count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in fetchEventRegistrationCount:', error);
    return 0;
  }
};
