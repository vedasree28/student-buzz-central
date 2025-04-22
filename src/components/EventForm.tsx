import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEvents, EventCategory, CampusType } from '@/contexts/EventContext';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label as UiLabel } from "@/components/ui/label";

type EventFormProps = {
  mode: 'create' | 'edit';
};

const EventForm = ({ mode }: EventFormProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { events, addEvent, updateEvent } = useEvents();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('academic');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1505373877841-8d25f7d46678');
  const [organizer, setOrganizer] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [campusType, setCampusType] = useState<CampusType>('on');
  
  const categories: { value: EventCategory; label: string }[] = [
    { value: 'academic', label: 'Academic' },
    { value: 'social', label: 'Social' },
    { value: 'career', label: 'Career' },
    { value: 'sports', label: 'Sports' },
    { value: 'arts', label: 'Arts' },
    { value: 'other', label: 'Other' },
  ];
  
  useEffect(() => {
    if (mode === 'edit' && id) {
      const eventToEdit = events.find(e => e.id === id);
      if (eventToEdit) {
        setTitle(eventToEdit.title);
        setDescription(eventToEdit.description);
        setCategory(eventToEdit.category);
        setLocation(eventToEdit.location);
        setOrganizer(eventToEdit.organizer);
        setCapacity(eventToEdit.capacity);
        setImageUrl(eventToEdit.imageUrl);
        setCampusType(eventToEdit.campusType || 'on');
        
        // Parse dates and times
        const startDateTime = new Date(eventToEdit.startDate);
        const endDateTime = new Date(eventToEdit.endDate);
        
        setStartDate(format(startDateTime, 'yyyy-MM-dd'));
        setStartTime(format(startDateTime, 'HH:mm'));
        setEndDate(format(endDateTime, 'yyyy-MM-dd'));
        setEndTime(format(endDateTime, 'HH:mm'));
      }
    }
  }, [mode, id, events]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time strings into ISO date strings
    const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
    const endDateTime = new Date(`${endDate}T${endTime}`).toISOString();
    
    if (mode === 'create') {
      addEvent({
        title,
        description,
        category,
        location,
        campusType,
        startDate: startDateTime,
        endDate: endDateTime,
        imageUrl,
        organizer,
        capacity,
      });
      navigate('/events');
    } else if (mode === 'edit' && id) {
      updateEvent(id, {
        title,
        description,
        category,
        location,
        campusType,
        startDate: startDateTime,
        endDate: endDateTime,
        imageUrl,
        organizer,
        capacity,
      });
      navigate(`/events/${id}`);
    }
  };
  
  return (
    <div className="container max-w-3xl py-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        {mode === 'create' ? 'Create New Event' : 'Edit Event'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as EventCategory)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL for an event image. For example: https://images.unsplash.com/photo...
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="organizer">Organizer</Label>
            <Input
              id="organizer"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="grid gap-2">
            <UiLabel>Campus Location</UiLabel>
            <RadioGroup
              value={campusType}
              onValueChange={(v) => setCampusType(v as CampusType)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="on" id="on-campus" />
                <UiLabel htmlFor="on-campus">On Campus</UiLabel>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="off" id="off-campus" />
                <UiLabel htmlFor="off-campus">Off Campus</UiLabel>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">
            {mode === 'create' ? 'Create Event' : 'Update Event'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
