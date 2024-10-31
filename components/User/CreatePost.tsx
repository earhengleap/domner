// components/CreatePost.tsx
'use client'
import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2, Hash, AtSign, ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from '@/hooks/use-toast';
import { useUpload } from '@/hooks/use-upload';
import { compressImage } from '@/lib/upload-helper';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CAMBODIA_PROVINCES,
  POST_AREAS,
  POST_CATEGORIES,
  TRENDING_HASHTAGS,
  type ImageWithPreview,
  type CreatePostData,
  CambodiaProvince,
  PostArea,
  PostCategory,
} from '@/types/post';

export const CreatePost = () => {
  const router = useRouter();
  const { upload, isUploading } = useUpload();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [photos, setPhotos] = useState<ImageWithPreview[]>([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  
  // UI states
  const [isTagging, setIsTagging] = useState<'hashtag' | 'mention' | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCaption(value);

    // Check for hashtags and mentions
    const lastChar = value[value.length - 1];
    const words = value.split(' ');
    const lastWord = words[words.length - 1];

    if (lastChar === '#') {
      setIsTagging('hashtag');
    } else if (lastChar === '@') {
      setIsTagging('mention');
    } else if (lastWord.startsWith('#')) {
      setIsTagging('hashtag');
    } else if (lastWord.startsWith('@')) {
      setIsTagging('mention');
    } else {
      setIsTagging(null);
    }
  };

  const addHashtag = (tag: string) => {
    if (!hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setCaption(prev => `${prev}#${tag} `);
    }
    setIsTagging(null);
  };

  const addMention = (username: string) => {
    if (!mentions.includes(username)) {
      setMentions([...mentions, username]);
      setCaption(prev => `${prev}@${username} `);
    }
    setIsTagging(null);
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
    setCaption(prev => prev.replace(`#${tag} `, ''));
  };

  const removeMention = (username: string) => {
    setMentions(mentions.filter(u => u !== username));
    setCaption(prev => prev.replace(`@${username} `, ''));
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const processedFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
          const compressed = await compressImage(file);
          return Object.assign(compressed, {
            preview: URL.createObjectURL(compressed)
          });
        })
      );

      setPhotos(prev => {
        const combined = [...prev, ...processedFiles];
        if (combined.length > 4) {
          toast({
            title: "Maximum 4 photos allowed",
            description: "Some photos were not added",
            variant: "destructive",
          });
          return combined.slice(0, 4);
        }
        return combined;
      });
    } catch (error) {
      toast({
        title: "Error processing images",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 4,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photos.length || !caption || !location || !area || !category) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      // Upload photos
      const uploadedUrls = await upload(photos);
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create post
      const postData: CreatePostData = {
        photos: uploadedUrls,
        caption,
        location: location as CambodiaProvince,
        area: area as PostArea,
        category: category as PostCategory,
        hashtags,
        mentions,
      };

      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) throw new Error('Failed to create post');

      toast({
        title: "Success",
        description: "Post created successfully!",
      });

      // Clean up and redirect
      photos.forEach(photo => URL.revokeObjectURL(photo.preview));
      router.push('/posts');
      router.refresh();

    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup effect
  React.useEffect(() => {
    return () => {
      photos.forEach(photo => URL.revokeObjectURL(photo.preview));
    };
  }, [photos]);

    function removePhoto(index: number) {
        throw new Error('Function not implemented.');
    }

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>Share your moments with photos and details</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div className="space-y-4">
              <div 
                {...getRootProps()} 
                className={`
                  border-2 border-dashed rounded-lg p-6 cursor-pointer
                  transition-colors duration-200
                  ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}
                  ${photos.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input {...getInputProps()} disabled={photos.length >= 4} />
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {isDragActive
                      ? "Drop the photos here"
                      : photos.length >= 4
                      ? "Maximum photos reached"
                      : "Drag & drop photos here, or click to select"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Maximum 4 photos, 10MB each
                  </p>
                </div>
              </div>

              {/* Photo Previews */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square group">
                      <img
                        src={photo.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onClick={() => setPreviewPhoto(photo.preview)}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white hover:text-white/80"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto(index);
                          }}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Caption with Hashtags and Mentions */}
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <div className="relative">
                <Textarea
                  ref={captionRef}
                  id="caption"
                  value={caption}
                  onChange={handleCaptionChange}
                  placeholder="Write a caption... Use # for hashtags and @ for mentions"
                  className="min-h-[120px]"
                />
                
                {/* Hashtag Suggestions */}
                {isTagging === 'hashtag' && (
                  <Card className="absolute bottom-full mb-2 w-full z-10">
                    <Command>
                      <CommandInput placeholder="Search hashtags..." />
                      <CommandEmpty>No hashtags found.</CommandEmpty>
                      <CommandGroup>
                        {TRENDING_HASHTAGS.map((tag) => (
                          <CommandItem
                            key={tag}
                            onSelect={() => addHashtag(tag)}
                            className="cursor-pointer"
                          >
                            <Hash className="h-4 w-4 mr-2" />
                            {tag}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </Card>
                )}

                {/* Active Tags Display */}
                {(hashtags.length > 0 || mentions.length > 0) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {hashtags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeHashtag(tag)}
                      >
                        #{tag} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                    {mentions.map((username) => (
                      <Badge
                        key={username}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => removeMention(username)}
                      >
                        @{username} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Location, Area, Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CAMBODIA_PROVINCES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger id="area">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(POST_AREAS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(POST_CATEGORIES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (photos.length > 0 || caption || location || area || category) {
                    setShowDiscardDialog(true);
                  } else {
                    router.back();
                  }
                }}
                disabled={isSubmitting || isUploading}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={
                  isSubmitting || 
                  isUploading || 
                  !photos.length || 
                  !caption || 
                  !location || 
                  !area || 
                  !category
                }
              >
                {isSubmitting || isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? 'Uploading...' : 'Creating Post...'}
                  </>
                ) : (
                  'Create Post'
                )}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {(isSubmitting || isUploading) && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {isUploading ? 'Uploading photos...' : 'Creating post...'}
                </span>
                <span className="text-sm font-medium">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Dialogs */}
      <Dialog open={previewPhoto !== null} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-3xl">
          {previewPhoto && (
            <img
              src={previewPhoto}
              alt="Preview"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
            <DialogDescription>
              Are you sure you want to discard your changes? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDiscardDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                photos.forEach(photo => URL.revokeObjectURL(photo.preview));
                router.back();
              }}
            >
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!error} onOpenChange={() => setError(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setError(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePost;