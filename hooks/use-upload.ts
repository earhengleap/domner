// hooks/use-upload.ts
import { useState, useCallback } from "react";
import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  
  const { startUpload } = useUploadThing("imageUploader", {
    onUploadBegin: () => {
      setIsUploading(true);
    },
    onClientUploadComplete: () => {
      setIsUploading(false);
    },
    onUploadError: (error) => {
      setIsUploading(false);
      throw error;
    },
  });

  const upload = useCallback(async (files: File[]) => {
    try {
      const uploadedFiles = await startUpload(files);
      return uploadedFiles?.map((file) => file.url) ?? [];
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  }, [startUpload]);

  return {
    upload,
    isUploading,
  };
};