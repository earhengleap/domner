// File: app/components/AvailabilitySection.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { SelectMultipleEventHandler } from "react-day-picker";

interface AvailabilitySectionProps {
  postId: string;
}

export const AvailabilitySection: React.FC<AvailabilitySectionProps> = ({
  postId,
}) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const router = useRouter();

  const handleSelect: SelectMultipleEventHandler = (days) => {
    setSelectedDates(days || []);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ availability: selectedDates }),
      });

      if (response.ok) {
        toast.success("Availability set successfully!");
        router.push("/guide-dashboard");
      } else {
        const errorData = await response.json();
        toast.error(`Failed to set availability: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error setting availability:", error);
      toast.error("An error occurred while setting availability.");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Set Your Availability</h2>
      <p className="text-sm text-gray-500">
        Select the dates you're available for this tour.
      </p>
      <Calendar
        mode="multiple"
        selected={selectedDates}
        onSelect={handleSelect}
        className="rounded-md border"
      />
      <div className="flex justify-end space-x-4">
        <Button
          onClick={() => router.push("/guide-dashboard")}
          variant="outline"
        >
          Skip for Now
        </Button>
        <Button onClick={handleSubmit} className="bg-green-500">
          Set Availability
        </Button>
      </div>
    </div>
  );
};
