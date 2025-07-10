# RRP – Real-Time Notification Platform: Student Event Notification Website

A web platform designed to help students stay updated with academic and extracurricular events, announcements, and opportunities in real time.

## Project Description

RRP is a student-focused event notification system that delivers real-time updates about upcoming events within the institution. Students can register for events, view event details, and receive automated notifications.

## Features

- Real-time notifications for student events
- Student dashboard with upcoming and registered events
- Event registration and participation tracking
- Categorized event listings (technical, cultural, academic)
- Admin dashboard to create, edit, or remove events
- Backend integration with Supabase

## Project Structure

project-root  
├── public  
├── src  
│   ├── components  
│   ├── pages  
│   ├── utils  
│   ├── integrations  
│   │   └── supabase  
│   └── hooks  
├── types  
└── README.md

## Tech Stack

Frontend: React.js, Tailwind CSS  
Backend: Supabase (PostgreSQL)
Notification Services: Twilio, SendGrid  
Authentication: Supabase Auth  
Deployment: Vercel  
Version Control: GitHub

## Admin Panel 

An optional admin dashboard allows event managers or authorized personnel to:

- Create and update events
- Monitor student registrations
- Send manual announcements or automated alerts

