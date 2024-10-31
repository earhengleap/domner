// src/components/CreateNewPostForm/index.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { BasicInfo } from "./BasicInfo";
import { ItinerarySection } from "./ItinerarySection";
import { PhotoUpload } from "./PhotoUpload";
import { DocumentUpload } from "./DocumentUpload";
import { DateSelection } from "./DateSelection";
import { Button } from "@/components/ui/button";

export interface FormData {
  title: string;
  location: string;
  area: string;
  type: string;
  about: string;
  packageOffer: string;
  highlight: string;
  fullDescription: string;
  include: string;
  notSuitableFor: string;
  importantInfo: string;
  price: string;
  itinerary: Array<{ title: string; content: string }>;
  photos: string[];
  offlineMapUrl: string;
  bookletUrl: string;
  termsUrl: string;
  availableDates: string[];
}

export const CreateNewPostForm: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    location: "",
    area: "",
    type: "",
    about: "",
    packageOffer: "",
    highlight: "",
    fullDescription: "",
    include: "",
    notSuitableFor: "",
    importantInfo: "",
    price: "",
    itinerary: [{ title: "", content: "" }],
    photos: [],
    offlineMapUrl: "",
    bookletUrl: "",
    termsUrl: "",
    availableDates: [],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleChange = (name: keyof FormData, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitting form data:", JSON.stringify(formData, null, 2));
    try {
      const response = await fetch("/api/posts/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Post submitted successfully!");
        router.push("/guide-dashboard");
      } else {
        const errorData = await response.json();
        toast.error(`Failed to submit post: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      toast.error("An error occurred while submitting the post.");
    }
  };

  if (status === "loading") {
    return <div className="loader"/>;
  }

  if (!session) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <BasicInfo formData={formData} onChange={handleChange} />
      <ItinerarySection
        itinerary={formData.itinerary}
        onChange={(itinerary) => handleChange("itinerary", itinerary)}
      />
      <PhotoUpload
        photos={formData.photos}
        onChange={(photos) => handleChange("photos", photos)}
      />
      <DocumentUpload documents={formData} onChange={handleChange} />
      <DateSelection
        availableDates={formData.availableDates}
        onChange={(dates) => handleChange("availableDates", dates)}
      />
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-500">
          Post
        </Button>
      </div>
    </form>
  );
};