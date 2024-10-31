// types/next-auth.d.ts

import NextAuth from 'next-auth';
import { DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      role: string;
      image: string | null;
      emailVerified: boolean | null; // Ensure emailVerified is included
    };
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    emailVerified: boolean | null; // Ensure emailVerified is included
  }
}
export interface Post {
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
  include: string[];
  notSuitableFor: string[];
  importantInfo: string[];
  photos: string[];
  offlineMapUrl: string;
  bookletUrl: string;
  termsUrl: string;
  createdAt: string;
  updatedAt: string;
  itinerary: Array<{ title: string; content: string }>;
}
// types/types.ts

export interface GuidePost {
  id: string;
  userId: string;
  title: string;
  location: string;
  area: string;
  type: string;
  about: string;
  packageOffer: string;
  highlight: string;
  fullDescription: string;
  include: string;
  notSuitableFor: string;
  importantInfo: string;
  price: number;
  photos: string[];
  offlineMapUrl: string | null;
  bookletUrl: string | null;
  termsUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  itinerary: ItineraryItem[];
  user: User;
}
export interface User {
  name: string | null;
  email: string | null;
  image: string | null;
  guideProfile: GuideProfile | null;
}
export interface GuideProfile {
  id: string;
  userId: string;
  organizationName: string | null;
  location: string | null;
  phone: string | null;
}
export interface ItineraryItem {
  id: string;
  title: string;
  content: string;
}