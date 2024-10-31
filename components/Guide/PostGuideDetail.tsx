// src/components/Guide/PostDetail.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  category: string;
  area: string;
  type: string;
  about: string;
  packageOffer: string;
  highlight: string;
  fullDescription: string;
  include: string;
  notSuitableFor: string;
  importantInfo: string;
  photos: string[];
  offlineMapUrl: string;
  bookletUrl: string;
  termsUrl: string;
  createdAt: string;
  updatedAt: string;
  itinerary: Array<{ title: string; content: string }>;
}

interface PostDetailProps {
  post: Post;
  onClose: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white p-8 rounded-lg max-w-3xl w-full my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{post.title}</h2>
          <Button onClick={onClose} variant="outline">Close</Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          {post.photos.map((photo, index) => (
            <img key={index} src={photo} alt={`${post.title} - Photo ${index + 1}`} className="w-full h-48 object-cover rounded-lg" />
          ))}
        </div>
        
        <div className="mb-4">
          <p className="text-lg font-semibold">Location: {post.location}</p>
          <p className="text-lg font-semibold">Price: ${post.price.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Type: {post.type}</p>
          <p className="text-sm text-gray-500">Area: {post.area}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">About</h3>
          <p>{post.about}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Package Offer</h3>
          <p>{post.packageOffer}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Highlight</h3>
          <p>{post.highlight}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Full Description</h3>
          <p>{post.fullDescription}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Includes</h3>
          <p>{post.include}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Not Suitable For</h3>
          <p>{post.notSuitableFor}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Important Information</h3>
          <p>{post.importantInfo}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Itinerary</h3>
          {post.itinerary.map((item, index) => (
            <div key={index} className="mb-2">
              <h4 className="font-semibold">{item.title}</h4>
              <p>{item.content}</p>
            </div>
          ))}
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Additional Resources</h3>
          {post.offlineMapUrl && (
            <p><a href={post.offlineMapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Offline Map</a></p>
          )}
          {post.bookletUrl && (
            <p><a href={post.bookletUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Booklet</a></p>
          )}
          {post.termsUrl && (
            <p><a href={post.termsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms and Conditions</a></p>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          <p>Created: {new Date(post.createdAt).toLocaleString()}</p>
          <p>Last updated: {new Date(post.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;