// src/components/CreateNewPostForm/PhotoUpload.tsx
import React from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast';
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ photos, onChange }) => {
  const removePhoto = (indexToRemove: number) => {
    onChange(photos.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <Label>Add photos of your guide location</Label>
      <Card className="h-40 flex items-center justify-center border-dashed border-2">
        <CardContent>
          <UploadButton<OurFileRouter, "imageUploader">
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (res) {
                const newUrls = res.map(file => file.url);
                onChange([...photos, ...newUrls]);
                toast.success('Photos uploaded successfully');
              }
            }}
            onUploadError={(error: Error) => {
              toast.error(`ERROR! ${error.message}`);
            }}
          />
        </CardContent>
      </Card>
      {photos.length > 0 && (
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative">
              <img src={photo} alt={`Uploaded photo ${index + 1}`} className="w-full h-32 object-cover rounded" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1"
                onClick={() => removePhoto(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};