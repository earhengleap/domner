// pages/approved-posts.tsx

import React from 'react';
import ApprovedPostsList from '@/components/Guide/ApprovedPostsList';

const ApprovedPostsPage = () => {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center my-8">Approved Guide Posts</h1>
      <ApprovedPostsList />
    </div>
  );
};

export default ApprovedPostsPage;