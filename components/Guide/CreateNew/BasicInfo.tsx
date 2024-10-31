// src/components/CreateNewPostForm/BasicInfo.tsx
import React from 'react';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FormData } from './types';

interface BasicInfoProps {
  formData: FormData;
  onChange: (name: keyof FormData, value: string) => void;
}

const cambodianLocations = [
  "Banteay Meanchey",
  "Battambang",
  "Kampong Cham",
  "Kampong Chhnang",
  "Kampong Speu",
  "Kampong Thom",
  "Kampot",
  "Kandal",
  "Kep",
  "Koh Kong",
  "Kratie",
  "Mondulkiri",
  "Oddar Meanchey",
  "Pailin",
  "Phnom Penh (Capital City)",
  "Preah Sihanouk (Sihanoukville)",
  "Preah Vihear",
  "Prey Veng",
  "Pursat",
  "Ratanakiri",
  "Siem Reap",
  "Stung Treng",
  "Svay Rieng",
  "Takeo",
  "Tbong Khmum"
];

const areaParts = [
  "Highland and Trekking",
  "Mangrove and Rainforest",
  "Wetland and Waterway"
];

const types = [
  "Culture",
  "Nature"
];

export const BasicInfo: React.FC<BasicInfoProps> = ({ formData, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title of Place</Label>
        <Input 
          id="title" 
          name="title" 
          value={formData.title} 
          onChange={(e) => onChange('title', e.target.value)} 
          placeholder="Enter title" 
          required 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Select onValueChange={(value) => onChange('location', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {cambodianLocations.map((location) => (
              <SelectItem key={location} value={location}>{location}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="area">Area part</Label>
        <Select onValueChange={(value) => onChange('area', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select area" />
          </SelectTrigger>
          <SelectContent>
            {areaParts.map((area) => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select onValueChange={(value) => onChange('type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {types.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="about">About this place</Label>
        <Textarea 
          id="about" 
          name="about" 
          value={formData.about} 
          onChange={(e) => onChange('about', e.target.value)} 
          placeholder="About this place" 
          required 
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="packageOffer">The Package offer</Label>
        <Input 
          id="packageOffer" 
          name="packageOffer" 
          value={formData.packageOffer} 
          onChange={(e) => onChange('packageOffer', e.target.value)} 
          placeholder="The Package offer" 
          required 
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="highlight">Highlight</Label>
        <Input 
          id="highlight" 
          name="highlight" 
          value={formData.highlight} 
          onChange={(e) => onChange('highlight', e.target.value)} 
          placeholder="Highlight" 
          required 
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="fullDescription">Full Description</Label>
        <Textarea 
          id="fullDescription" 
          name="fullDescription" 
          value={formData.fullDescription} 
          onChange={(e) => onChange('fullDescription', e.target.value)} 
          placeholder="Full Description" 
          required 
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="include">Include</Label>
        <Input 
          id="include" 
          name="include" 
          value={formData.include} 
          onChange={(e) => onChange('include', e.target.value)} 
          placeholder="Include" 
          required 
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="notSuitableFor">Not suitable for</Label>
        <Input 
          id="notSuitableFor" 
          name="notSuitableFor" 
          value={formData.notSuitableFor} 
          onChange={(e) => onChange('notSuitableFor', e.target.value)} 
          placeholder="Not suitable for" 
          required 
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="importantInfo">Important Information</Label>
        <Textarea 
          id="importantInfo" 
          name="importantInfo" 
          value={formData.importantInfo} 
          onChange={(e) => onChange('importantInfo', e.target.value)} 
          placeholder="Important Information" 
          required 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input 
          id="price" 
          name="price" 
          type="number" 
          value={formData.price} 
          onChange={(e) => onChange('price', e.target.value)} 
          placeholder="Price" 
          required 
        />
      </div>
    </div>
  );
};