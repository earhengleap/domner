'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, Camera } from "lucide-react";

interface UserProfile {
  id: string;
  userId: string;
  dob: Date | null;
  image: string | null;
  username: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProfileFormProps {
  initialProfile: UserProfile | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(30, "Username must not be longer than 30 characters"),
  dob: z.date().optional(),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address must not be longer than 100 characters")
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm({ initialProfile, user }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, update: updateSession } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialProfile?.image || null
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: initialProfile?.username || "",
      dob: initialProfile?.dob ? new Date(initialProfile.dob) : undefined,
      address: initialProfile?.address || "",
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();

      // Update session with new username
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: values.username,
        },
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Error",
        description: "File type not supported. Please use JPEG, PNG, GIF, or WebP",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload image
      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { imageUrl } = await response.json();

      // Update session with new image
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          image: imageUrl,
        },
      });

      setPreviewImage(imageUrl);

      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });

      router.refresh();
    } catch (error) {
      console.error('Error uploading image:', error);
      setPreviewImage(initialProfile?.image || null);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
      {/* Image Upload Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group">
          <Avatar className="w-32 h-32 border-2 border-gray-200">
            <AvatarImage 
              src={previewImage || ""} 
              alt={user.name || "Profile"} 
              className="object-cover"
            />
            <AvatarFallback className="text-2xl bg-primary/10">
              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <label
            htmlFor="imageUpload"
            className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer 
                     hover:bg-primary/90 transition-colors group-hover:scale-105"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Camera className="w-4 h-4 text-white" />
            )}
          </label>
          <input
            id="imageUpload"
            type="file"
            accept={ALLOWED_FILE_TYPES.join(",")}
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Click the camera icon to update your profile picture
        </p>
      </div>

      {/* Profile Form Section */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter your username"
                    className="bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of birth</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter your address"
                    className="bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={isUploading || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}