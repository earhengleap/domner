// File: app/components/BookingComponent.tsx

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface BookingComponentProps {
  postId: string;
}

export const BookingComponent: React.FC<BookingComponentProps> = ({ postId }) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/availability`);
        if (response.ok) {
          const data = await response.json();
          setAvailableDates(data.availability.map((dateString: string) => new Date(dateString)));
        } else {
          toast.error('Failed to fetch availability');
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
        toast.error('An error occurred while fetching availability');
      }
    };

    fetchAvailability();
  }, [postId]);

  const handleDateSelect = (dates: Date[] | undefined) => {
    setSelectedDates(dates || []);
  };

  const handleBooking = async () => {
    // Implement booking logic here
    toast.success('Booking successful!');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Available Dates</h2>
      <Calendar
        mode="multiple"
        selected={selectedDates}
        onSelect={handleDateSelect}
        disabled={(date) => !availableDates.some(d => d.toDateString() === date.toDateString())}
        className="rounded-md border"
      />
      <div>
        <h3 className="text-lg font-semibold">Selected Dates:</h3>
        <ul>
          {selectedDates.map((date, index) => (
            <li key={index}>{date.toLocaleDateString()}</li>
          ))}
        </ul>
      </div>
      <Button onClick={handleBooking} disabled={selectedDates.length === 0}>
        Book Now
      </Button>
    </div>
  );
};