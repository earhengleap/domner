'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

// Types
interface UserProfile {
  id: string;
  userId: string;
  dob: Date | null;
  image: string | null;
  username: string | null;
  address: string | null;
}

interface UserContextType {
  userName: string;
  userEmail: string;
  userImage: string | null;
  isLoading: boolean;
  userProfile: UserProfile | null;
  updateUser: (name: string, email: string) => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateProfileImage: (imageUrl: string) => Promise<void>;
}

const defaultContextValue: UserContextType = {
  userName: '',
  userEmail: '',
  userImage: null,
  isLoading: false,
  userProfile: null,
  updateUser: () => {},
  updateProfile: async () => {},
  updateProfileImage: async () => {},
};

const UserContext = createContext<UserContextType>(defaultContextValue);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Fetch user profile when session changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user) {
        try {
          setIsLoading(true);
          const response = await fetch('/api/profile/get');
          if (response.ok) {
            const data = await response.json();
            setUserProfile(data.profile);
            setUserName(data.profile?.username || session.user.name || '');
            setUserEmail(session.user.email || '');
            setUserImage(data.profile?.image || session.user.image || null);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
  }, [session]);

  const updateUser = (name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      setUserProfile(prev => ({
        ...prev,
        ...result.data.profile,
      }));

      if (data.username) {
        setUserName(data.username);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileImage = async (imageUrl: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile image');
      }

      setUserImage(imageUrl);
      setUserProfile(prev => prev ? {
        ...prev,
        image: imageUrl,
      } : null);

      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile image:', error);
      toast({
        title: "Error",
        description: "Failed to update profile image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        userName, 
        userEmail, 
        userImage,
        isLoading,
        userProfile,
        updateUser, 
        updateProfile,
        updateProfileImage
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}