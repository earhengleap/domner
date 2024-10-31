'use client'
import React, { useState, useEffect } from 'react';
import ReviewCarousel from './ReviewsFront';
import ReviewFront from './ReviewsFront';

interface User {
  id: string;
  name: string;
  image: string | null;
}

interface GuidePost {
  id: string;
  title: string;
}

interface Review {
  id: string;
  userId: string;
  guidePostId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  guidePost: GuidePost;
}

interface ReviewContainerProps {
  title?: string;
  subtitle?: string;
}

const ReviewContainer: React.FC<ReviewContainerProps> = ({ 
  
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reviews/featured');
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReview = async (content: string) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add review');
      }

      const newReview = await response.json();
      setReviews(prev => [newReview, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add review');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16">
      
      <ReviewFront 
        reviews={reviews}
        onAddReview={handleAddReview}
      />
    </section>
  );
};

export default ReviewContainer;