// src/components/DateSelection.tsx
import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from "@/components/ui/button";

const localizer = momentLocalizer(moment);

interface DateSelectionProps {
  availableDates: string[];
  onChange: (dates: string[]) => void;
}

export const DateSelection: React.FC<DateSelectionProps> = ({ availableDates, onChange }) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>(
    availableDates.map(date => new Date(date))
  );
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleDateSelect = useCallback(
    ({ start }: { start: Date }) => {
      const utcDate = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
      const isSelected = selectedDates.some(date => date.getTime() === utcDate.getTime());
      let newDates;
      if (isSelected) {
        newDates = selectedDates.filter(date => date.getTime() !== utcDate.getTime());
      } else {
        newDates = [...selectedDates, utcDate];
      }
      setSelectedDates(newDates);
      onChange(newDates.map(formatDateForStorage));
    },
    [selectedDates, onChange]
  );

  const removeDate = useCallback(
    (dateToRemove: Date) => {
      const newDates = selectedDates.filter(
        date => date.getTime() !== dateToRemove.getTime()
      );
      setSelectedDates(newDates);
      onChange(newDates.map(formatDateForStorage));
    },
    [selectedDates, onChange]
  );

  // Function to format date for storage (YYYY-MM-DD)
  const formatDateForStorage = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Function to format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (date: Date): string => {
    return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`;
  };

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: '#34D399',
      borderRadius: '0px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    }
  });

  const onNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Available Dates</h3>
      <div style={{ height: '500px' }}>
        <Calendar
          localizer={localizer}
          events={selectedDates.map(date => ({
            start: date,
            end: date,
            title: 'Available'
          }))}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleDateSelect}
          eventPropGetter={eventStyleGetter}
          views={['month']}
          style={{ 
            backgroundColor: '#F0FDF4',
            padding: '20px',
            borderRadius: '8px'
          }}
          onNavigate={onNavigate}
          date={currentDate}
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {selectedDates.map(date => (
          <Button
            key={date.toISOString()}
            variant="outline"
            size="sm"
            onClick={() => removeDate(date)}
            className="bg-green-100 text-green-700 hover:bg-green-200"
          >
            {formatDateForDisplay(date)} ✕
          </Button>
        ))}
      </div>
    </div>
  );
};