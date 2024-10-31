// components/PhotoUploadSection.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhotoUploadSectionProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export const PhotoUploadSection: React.FC<PhotoUploadSectionProps> = ({ photos, onChange }) => {
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map(file => URL.createObjectURL(file));
    onChange([...photos, ...newPhotos]);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="photos">Photos</Label>
      <Input id="photos" name="photos" type="file" multiple onChange={handlePhotoUpload} accept="image/*" />
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {photos.map((photo, index) => (
            <img key={index} src={photo} alt={`Uploaded photo ${index + 1}`} className="w-full h-32 object-cover" />
          ))}
        </div>
      )}
    </div>
  );
};