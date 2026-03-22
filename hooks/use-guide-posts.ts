import { useQuery } from '@tanstack/react-query';

export interface GuidePost {
  id: string;
  title: string;
  location: string;
  fullDescription: string;
  area: string;
  type: string;
  photos: string[];
}

const fetchGuidePosts = async (): Promise<GuidePost[]> => {
  const response = await fetch('/api/all-guide-posts');
  if (!response.ok) {
    throw new Error('Failed to fetch guide posts');
  }
  return response.json();
};

export const useGuidePosts = () => {
  return useQuery<GuidePost[]>({
    queryKey: ['guidePosts'],
    queryFn: fetchGuidePosts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
