// src/components/CreateNewPostForm/ItinerarySection.tsx
import React from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PlusCircle, X } from 'lucide-react'
import { Itinerary } from './types';

interface ItinerarySectionProps {
  itinerary: Itinerary[];
  onChange: (itinerary: Itinerary[]) => void;
}

export const ItinerarySection: React.FC<ItinerarySectionProps> = ({ itinerary, onChange }) => {
  const handleItineraryChange = (index: number, field: keyof Itinerary, value: string) => {
    const newItinerary = itinerary.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(newItinerary);
  };

  const addItinerary = () => {
    onChange([...itinerary, { title: '', content: '' }]);
  };

  const removeItinerary = (index: number) => {
    onChange(itinerary.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Label>Itinerary</Label>
      {itinerary.map((item, index) => (
        <div key={index} className="flex space-x-2 items-center">
          <Input 
            placeholder="Title" 
            value={item.title}
            onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
            required
          />
          <Input 
            placeholder="Content" 
            value={item.content}
            onChange={(e) => handleItineraryChange(index, 'content', e.target.value)}
            required
          />
          <Button type="button" variant="outline" onClick={() => removeItinerary(index)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" className="w-full" onClick={addItinerary}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add an Itinerary
      </Button>
    </div>
  );
};