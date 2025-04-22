
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventContext';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Bell, BellOff } from 'lucide-react';
import { format } from 'date-fns';

// Mock notifications data
const initialNotifications = [
  {
    id: '1',
    title: 'Reminder: Freshman Orientation',
    description: 'Your registered event starts tomorrow at 9:00 AM',
    date: '2025-06-09T15:00:00Z',
    read: false,
    eventId: '1',
  },
  {
    id: '2',
    title: 'New event: Spring Concert',
    description: 'A new event has been added that matches your interests',
    date: '2025-04-15T10:30:00Z',
    read: false,
    eventId: '3',
  },
  {
    id: '3',
    title: 'Registration confirmed: Hackathon',
    description: 'Your registration for the Hackathon event has been confirmed',
    date: '2025-03-01T09:15:00Z',
    read: true,
    eventId: '4',
  },
];

const Notifications = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { events } = useEvents();
  const [notifications, setNotifications] = useState(initialNotifications);
  
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(
      notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(
      notifications.filter(notification => notification.id !== notificationId)
    );
  };
  
  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);
    navigate(`/events/${notification.eventId}`);
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your event notifications
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <BellOff className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>
      
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map(notification => (
            <Card 
              key={notification.id}
              className={notification.read ? 'bg-card' : 'bg-blue-50 border-blue-100'}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center">
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                      )}
                      {notification.title}
                    </CardTitle>
                    <CardDescription>
                      {formatDate(notification.date)}
                    </CardDescription>
                  </div>
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground" 
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p>{notification.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  View Event
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50" 
                  onClick={() => deleteNotification(notification.id)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border rounded-lg">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No notifications</h2>
          <p className="text-muted-foreground mb-4">
            You don't have any notifications at the moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
