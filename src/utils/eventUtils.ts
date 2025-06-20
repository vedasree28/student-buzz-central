
import { EventType, EventStatus } from '@/types/eventTypes';

// Sample event data with proper UUID format
export const INITIAL_EVENTS: EventType[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Freshman Orientation',
    description: 'Welcome event for new students to get familiar with campus resources, meet faculty, and connect with peers.',
    category: 'academic',
    location: 'Main Auditorium',
    campus_type: 'on',
    start_date: '2025-06-25T09:00:00Z',
    end_date: '2025-06-25T14:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    organizer: 'Student Affairs Office',
    capacity: 300,
    registeredUsers: [],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Career Fair',
    description: 'Annual career fair with representatives from top companies across various industries.',
    category: 'career',
    location: 'University Center',
    campus_type: 'on',
    start_date: '2025-07-15T10:00:00Z',
    end_date: '2025-07-15T16:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    organizer: 'Career Services',
    capacity: 500,
    registeredUsers: [],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Spring Concert',
    description: 'Annual spring concert featuring popular artists and student performances.',
    category: 'arts',
    location: 'Campus Stadium',
    campus_type: 'off',
    start_date: '2025-08-20T18:00:00Z',
    end_date: '2025-08-20T22:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b',
    organizer: 'Student Activities Board',
    capacity: 2000,
    registeredUsers: [],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'Hackathon',
    description: '48-hour event where students collaborate on innovative tech projects and compete for prizes.',
    category: 'academic',
    location: 'Technology Building',
    campus_type: 'on',
    start_date: '2025-09-05T17:00:00Z',
    end_date: '2025-09-07T17:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    organizer: 'Computer Science Department',
    capacity: 150,
    registeredUsers: [],
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
  // Convert Supabase event to our EventType format
  return {
    id: String(event.id),
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
    registeredUsers: [] // Will be populated separately from registration queries
  };
};
