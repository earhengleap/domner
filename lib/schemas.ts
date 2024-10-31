import { z } from 'zod';

// Helper schemas
const DateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const PositiveNumber = z.number().positive();
const NonEmptyString = z.string().min(1);

// Itinerary item schema
const ItineraryItemSchema = z.object({
  title: NonEmptyString,
  content: NonEmptyString,
});

// Availability schema
const AvailabilitySchema = z.object({
  date: DateString,
  isAvailable: z.boolean(),
});

// User schema
const UserSchema = z.object({
  id: NonEmptyString,
  name: NonEmptyString,
  hostName: NonEmptyString, // Added host name field
  guideProfile: z.object({
    firstName: NonEmptyString,
    lastName: NonEmptyString,
    description: NonEmptyString,
  }).nullable(),
});

// Main GuidePost schema
export const GuidePostSchema = z.object({
  id: NonEmptyString,
  title: NonEmptyString,
  location: NonEmptyString,
  area: NonEmptyString,
  type: z.enum(['ADVENTURE', 'CULTURE', 'FOOD', 'NATURE', 'URBAN']), // Adjust enum values as needed
  about: NonEmptyString,
  packageOffer: NonEmptyString,
  highlight: NonEmptyString,
  fullDescription: NonEmptyString,
  include: NonEmptyString,
  notSuitableFor: NonEmptyString,
  importantInfo: NonEmptyString,
  price: PositiveNumber,
  photos: z.array(NonEmptyString).min(1),
  offlineMapUrl: z.string().url().nullable(),
  bookletUrl: z.string().url().nullable(),
  termsUrl: z.string().url().nullable(),
  itinerary: z.array(ItineraryItemSchema).min(1),
  availability: z.array(AvailabilitySchema),
  user: UserSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Types derived from the schema
export type GuidePost = z.infer<typeof GuidePostSchema>;
export type ItineraryItem = z.infer<typeof ItineraryItemSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type User = z.infer<typeof UserSchema>;

// Partial schema for updates
export const GuidePostUpdateSchema = GuidePostSchema.partial().omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  user: true 
});

// Schema for creating a new guide post
export const GuidePostCreateSchema = GuidePostSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  userId: NonEmptyString,
});