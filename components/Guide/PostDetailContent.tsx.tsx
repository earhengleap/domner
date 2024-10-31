// app/guide-dashboard/post/[postId]/PostDetailContent.tsx

'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Clock, User } from 'lucide-react';
import { GuidePost } from "@/types/types";

export default function PostDetailContent({ post }: { post: GuidePost }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <img src={post.photos[0] || '/placeholder-image.jpg'} alt={post.title} className="w-full h-64 object-cover rounded-md" />
            <div>
              <p className="text-xl font-semibold mb-2">{post.location}</p>
              <p className="text-lg text-green-700 mb-2">${post.price.toFixed(2)}</p>
              <div className="flex items-center mb-2">
                <Clock className="mr-2" size={16} />
                <span>Tour Type: {post.type}</span>
              </div>
              <div className="flex items-center mb-2">
                <User className="mr-2" size={16} />
                <span>Guide: {post.user.name || 'Unknown'}</span>
              </div>
              <p className="text-sm text-gray-600">Contact: {post.user.email || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">About</h2>
        <p>{post.about}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Itinerary</h2>
        {post.itinerary.map((item) => (
          <div key={item.id} className="mb-4">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p>{item.content}</p>
          </div>
        ))}
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Highlights</h2>
        <ul className="list-disc list-inside">
          {post.highlight.split('\n').map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Full Description</h2>
        <p>{post.fullDescription}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Includes</h2>
        <ul className="list-disc list-inside">
          {post.include.split('\n').map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Not suitable for</h2>
        <ul className="list-disc list-inside">
          {post.notSuitableFor.split('\n').map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Important Information</h2>
        <p>{post.importantInfo}</p>
      </section>
    </div>
  );
}