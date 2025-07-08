
-- Add some upcoming events
INSERT INTO events (
  title,
  description,
  category,
  location,
  campus_type,
  start_date,
  end_date,
  image_url,
  organizer,
  capacity
) VALUES 
(
  'Spring Tech Conference 2025',
  'Join us for an exciting day of technology talks, networking, and innovation. Featuring speakers from leading tech companies and startup founders.',
  'career',
  'Main Auditorium, Engineering Building',
  'on',
  '2025-01-15 09:00:00+00',
  '2025-01-15 17:00:00+00',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'Computer Science Department',
  200
),
(
  'Winter Art Exhibition Opening',
  'Celebrate the creativity of our talented students at the annual winter art exhibition. Featuring paintings, sculptures, and digital art.',
  'arts',
  'University Art Gallery',
  'on',
  '2025-01-20 18:00:00+00',
  '2025-01-20 21:00:00+00',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'Art Department',
  150
),
(
  'Campus Basketball Tournament',
  'Annual inter-department basketball tournament. Come support your team and enjoy exciting matches throughout the day.',
  'sports',
  'University Sports Complex',
  'on',
  '2025-01-25 10:00:00+00',
  '2025-01-25 18:00:00+00',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'Sports Department',
  300
),
(
  'Career Fair 2025',
  'Meet with top employers and explore internship and job opportunities. Bring your resume and dress professionally.',
  'career',
  'Student Union Building',
  'on',
  '2025-02-01 10:00:00+00',
  '2025-02-01 16:00:00+00',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'Career Services',
  500
),
(
  'Study Abroad Information Session',
  'Learn about exciting study abroad opportunities, scholarships, and application processes. Q&A session with returned students.',
  'academic',
  'International Student Center',
  'on',
  '2025-02-05 14:00:00+00',
  '2025-02-05 16:00:00+00',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'International Programs Office',
  100
),
(
  'Spring Social Mixer',
  'Start the semester right with our annual spring social mixer. Food, music, games, and a chance to meet new friends.',
  'social',
  'Campus Quad (Weather permitting)',
  'on',
  '2025-02-10 19:00:00+00',
  '2025-02-10 22:00:00+00',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'Student Activities Board',
  400
);
