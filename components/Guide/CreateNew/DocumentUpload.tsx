// src/components/CreateNewPostForm/DocumentUpload.tsx
import React from 'react';
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload } from 'lucide-react'
import { toast } from 'react-hot-toast';
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { FormData } from './types';

interface DocumentUploadProps {
  documents: Pick<FormData, 'offlineMapUrl' | 'bookletUrl' | 'termsUrl'>;
  onChange: (name: keyof FormData, value: string) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ documents, onChange }) => {
  return (
    <div className="space-y-4">
      <Label>Upload documents</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: 'Offline Map', field: 'offlineMapUrl' as keyof typeof documents },
          { name: 'Booklet', field: 'bookletUrl' as keyof typeof documents },
          { name: 'Term and Condition', field: 'termsUrl' as keyof typeof documents }
        ].map((doc) => (
          <div key={doc.name} className="space-y-2">
            <Card className="p-4 flex flex-col items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm font-medium mt-2">{doc.name}</p>
              <UploadButton<OurFileRouter, "pdfUploader">
                endpoint="pdfUploader"
                onClientUploadComplete={(res) => {
                  if (res && res.length > 0) {
                    onChange(doc.field, res[0].url);
                    toast.success(`${doc.name} uploaded successfully`);
                  }
                }}
                onUploadError={(error: Error) => {
                  console.error(`Error uploading ${doc.name}:`, error);
                  toast.error(`Error uploading ${doc.name}`);
                }}
              />
              {documents[doc.field] && (
                <p className="text-xs mt-2 text-green-500">Uploaded</p>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};