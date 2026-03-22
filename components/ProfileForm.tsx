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
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, Camera, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageCropper from "./ImageCropper";

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
    image: string;
  };
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jfif", "image/pjpeg"];

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
    initialProfile?.image || user?.image || null
  );
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

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

      // Update session with new username immediately
      await updateSession({
        user: {
          ...session?.user,
          name: values.username,
        }
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
      // Don't upload immediately. Open cropper first.
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading image:', error);
    }
  };

  const onCropComplete = async (croppedBlob: Blob) => {
    try {
      setIsUploading(true);

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', croppedBlob, 'profile.jpg');

      // Upload image
      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { imageUrl } = await response.json();
      
      // Update session with new image immediately
      await updateSession({
        user: {
          ...session?.user,
          image: imageUrl,
        }
      });

      setPreviewImage(imageUrl);

      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });

      router.refresh();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setImageToCrop(null);
    }
  };

  const isPending = isUploading || form.formState.isSubmitting;

  return (
    <div className="relative group/main">
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-3xl"
          >
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-brown-100 flex flex-col items-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#A18167]" />
              <p className="font-bold text-[#A18167] animate-pulse">Syncing Profile...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "grid lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-brown-100/50 transition-all duration-500",
        isPending && "blur-[1px] scale-[0.995]"
      )}>
      {/* Sidebar: Image Upload */}
      <div className="lg:col-span-1 p-8 bg-[#fdfbf9]/50">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#A18167] rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            <Avatar className="w-40 h-40 border-4 border-white shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
              <AvatarImage 
                src={previewImage || ""} 
                alt={user.name || "Profile"} 
                className="object-cover"
              />
              <AvatarFallback className="text-4xl bg-[#A18167]/10 text-[#A18167] font-bold">
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <label
              htmlFor="imageUpload"
              className="absolute bottom-2 right-2 p-3 bg-[#A18167] rounded-full cursor-pointer 
                       hover:bg-[#8e6f56] shadow-lg transition-all duration-300 group-hover:scale-110 z-20"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </label>
            <input
              id="imageUpload"
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.jfif"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="font-bold text-xl text-[#292929]">{user.name}</h3>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          <div className="w-full pt-6 border-t border-brown-100/30">
            <p className="text-sm text-center text-muted-foreground leading-relaxed">
              Allowed JPG, GIF or PNG. <br />Max size of 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Main Content: Profile Form */}
      <div className="lg:col-span-2 p-8 lg:p-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-8">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#A18167] font-semibold text-base">Display Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter your username"
                        className="bg-[#fdfbf9] border-brown-100/50 focus:border-[#A18167] focus:ring-[#A18167] h-12 text-lg rounded-xl transition-all"
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
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[#A18167] font-semibold text-base">Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-12 pl-3 text-left font-normal bg-[#fdfbf9] border-brown-100/50 hover:bg-[#A18167]/5 text-lg rounded-xl",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-3 h-5 w-5 opacity-50" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select your birth date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0 rounded-2xl border-brown-100">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          className="rounded-2xl"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#A18167] font-semibold text-base">Current Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="e.g. 123 Street, Phnom Penh"
                        className="bg-[#fdfbf9] border-brown-100/50 focus:border-[#A18167] focus:ring-[#A18167] min-h-[100px] text-lg rounded-xl transition-all resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-6 border-t border-brown-100/30 flex justify-end">
              <Button 
                type="submit" 
                className="bg-[#A18167] hover:bg-[#8e6f56] text-white h-12 px-8 text-lg font-bold rounded-xl shadow-lg shadow-brown-200/50 transition-all active:scale-95 disabled:opacity-50"
                disabled={isUploading || form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      </div>
      
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          open={cropModalOpen}
          onOpenChange={setCropModalOpen}
          onCropComplete={onCropComplete}
        />
      )}
    </div>
  );
}