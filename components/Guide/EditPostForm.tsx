// src/components/Guide/EditPostForm.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import Image from 'next/image';

interface Post {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  category: string;
  area: string;
  type: string;
  about: string;
  packageOffer: string;
  highlight: string;
  fullDescription: string;
  include: string;
  notSuitableFor: string;
  importantInfo: string;
  photos: string[];
  offlineMapUrl: string;
  bookletUrl: string;
  termsUrl: string;
  createdAt: string;
  updatedAt: string;
  itinerary: Array<{ title: string; content: string }>;
}

interface EditPostFormProps {
  post: Post;
  onSubmit: (updatedPost: Post) => void;
  onCancel: () => void;
}

export const EditPostForm: React.FC<EditPostFormProps> = ({ post, onSubmit, onCancel }) => {
  const [editedPost, setEditedPost] = useState<Post>(post);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedPost(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (newPhotos: string[]) => {
    setEditedPost(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  };

  const handleRemovePhoto = (index: number) => {
    setEditedPost(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleItineraryChange = (index: number, field: 'title' | 'content', value: string) => {
    setEditedPost(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItineraryItem = () => {
    setEditedPost(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { title: '', content: '' }]
    }));
  };

  const removeItineraryItem = (index: number) => {
    setEditedPost(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(editedPost);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Post</h2>
      
      <Input name="title" value={editedPost.title} onChange={handleInputChange} placeholder="Title" />
      <Input name="location" value={editedPost.location} onChange={handleInputChange} placeholder="Location" />
      <Input name="area" value={editedPost.area} onChange={handleInputChange} placeholder="Area" />
      <Input name="type" value={editedPost.type} onChange={handleInputChange} placeholder="Type" />
      <Input name="category" value={editedPost.category} onChange={handleInputChange} placeholder="Category" />
      <Input name="price" type="number" value={editedPost.price} onChange={handleInputChange} placeholder="Price" />
      
      <Textarea name="about" value={editedPost.about} onChange={handleInputChange} placeholder="About" />
      <Textarea name="packageOffer" value={editedPost.packageOffer} onChange={handleInputChange} placeholder="Package Offer" />
      <Textarea name="highlight" value={editedPost.highlight} onChange={handleInputChange} placeholder="Highlight" />
      <Textarea name="fullDescription" value={editedPost.fullDescription} onChange={handleInputChange} placeholder="Full Description" />
      <Textarea name="include" value={editedPost.include} onChange={handleInputChange} placeholder="Include" />
      <Textarea name="notSuitableFor" value={editedPost.notSuitableFor} onChange={handleInputChange} placeholder="Not Suitable For" />
      <Textarea name="importantInfo" value={editedPost.importantInfo} onChange={handleInputChange} placeholder="Important Info" />

      <Input name="offlineMapUrl" value={editedPost.offlineMapUrl} onChange={handleInputChange} placeholder="Offline Map URL" />
      <Input name="bookletUrl" value={editedPost.bookletUrl} onChange={handleInputChange} placeholder="Booklet URL" />
      <Input name="termsUrl" value={editedPost.termsUrl} onChange={handleInputChange} placeholder="Terms URL" />

      <div>
        <h3 className="text-lg font-semibold mb-2">Photos</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {editedPost.photos.map((photo, index) => (
            <div key={index} className="relative">
              <Image src={photo} alt={`Photo ${index + 1}`} width={100} height={100} className="object-cover rounded" />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <UploadButton<OurFileRouter, "imageUploader">
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            if (res) {
              const uploadedPhotos = res.map(file => file.url);
              handlePhotoUpload(uploadedPhotos);
            }
          }}
          onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`);
          }}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Itinerary</h3>
        {editedPost.itinerary.map((item, index) => (
          <div key={index} className="mb-2 p-2 border rounded">
            <Input
              value={item.title}
              onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
              placeholder="Itinerary Title"
              className="mb-1"
            />
            <Textarea
              value={item.content}
              onChange={(e) => handleItineraryChange(index, 'content', e.target.value)}
              placeholder="Itinerary Content"
              className="mb-1"
            />
            <Button type="button" onClick={() => removeItineraryItem(index)} className="bg-red-500 text-white">Remove</Button>
          </div>
        ))}
        <Button type="button" onClick={addItineraryItem} className="bg-green-500 text-white">Add Itinerary Item</Button>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={onCancel} className="bg-gray-300">Cancel</Button>
        <Button type="submit" className="bg-blue-500 text-white">Save Changes</Button>
      </div>
    </form>
  );
};