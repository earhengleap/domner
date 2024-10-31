import React from "react";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";

interface ImageInputProps {
  label: string;
  imageUrl?: string;
  setImageUrl: (url: string) => void;
  className?: string;
  endpoint: string;
}

export default function ImageInput({
  label,
  imageUrl = "",
  setImageUrl,
  className = "col-span-full",
  endpoint,
}: ImageInputProps) {
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <label
          htmlFor="course-image"
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-50 mb-2"
        >
          {label}
        </label>
        {imageUrl && (
          <button
            onClick={() => setImageUrl("")}
            type="button"
            className="flex space-x-2 bg-slate-900 rounded-md shadow text-slate-50 py-1.5 px-3"
          >
            <Pencil className="w-4 h-4" />
            <span className="text-sm">Change Image</span>
          </button>
        )}
      </div>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Item image"
          width={1000}
          height={667}
          className="w-16 h-16 object-contain rounded-full"
        />
      ) : (
        <div className="w-full h-24">
          <UploadButton
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
              if (res && res.length > 0) {
                setImageUrl(res[0].url);
                toast.success("Image Upload complete");
                console.log("Files: ", res);
                console.log("Upload Completed");
              }
            }}
            onUploadError={(error: Error) => {
              toast.error("Image Upload Failed, Try Again");
              console.log(`ERROR! ${error.message}`, error);
            }}
          />
        </div>
      )}
    </div>
  );
}