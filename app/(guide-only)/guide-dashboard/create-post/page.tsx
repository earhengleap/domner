// src/app/create-post/page.tsx
"use client"
import React from 'react';
import { CreateNewPostForm } from '@/components/Guide/CreateNew/CreateNewPost';

const CreatePostPage: React.FC = () => {
  return (
    <div className="container mx-auto py-18 p-36">
      <h1 className="text-3xl font-bold mb-6 text-center">Create a New Post</h1>
      <CreateNewPostForm />
    </div>
  );
};

export default CreatePostPage;