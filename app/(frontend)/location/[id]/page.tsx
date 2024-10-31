//location
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NavbarClient from '@/components/NavbarClient';
import Footer from '@/components/FooterSection';
interface GuidePost {
  id: string;
  title: string;
  guide: string;
  date: string;
  price: number;
  image: string;
  location: string;
}
const LocationSearchResults: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [guidePosts, setGuidePosts] = useState<GuidePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchGuidePosts = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/guidePosts?location=${encodeURIComponent(id as string)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch guide posts');
        }
        const data = await response.json();
        setGuidePosts(data);
      } catch (err) {
        setError('Failed to load guide posts. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuidePosts();
  }, [id]);
  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }
  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }
  return (
    <>
      <div className="container mx-auto p-4">
        <NavbarClient />
        <div className="mb-6 mt-20">
          <h1 className="text-3xl font-bold">Guide Posts for {id}</h1>
        </div>
        {guidePosts.length === 0 ? (
          <p>No guide posts found for this location.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {guidePosts.map((post) => (
              <Card key={post.id}>
                {/* <CardHeader className="p-0">
                  <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded-t-lg" />
                </CardHeader> */}
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                  <p className="text-sm text-gray-600">Guide: {post.guide}</p>
                  <p className="text-sm text-gray-600">{post.date}</p>
                  <p className="text-sm text-gray-600">Location: {post.location}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <span className="text-sm font-semibold">From ${post.price.toFixed(2)}</span>
                  <Button variant="outline" size="sm">Book</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};
export default LocationSearchResults;