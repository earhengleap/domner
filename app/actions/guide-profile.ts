// app/actions/guide-profile.ts
'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { GuideProfile } from '@/types';
import { supabase } from '@/app/supabase/supabaseClient';
import { uploadImageToSupabase } from '@/lib/image-upload';

export async function updateProfile(
  prevState: any,
  formData: FormData
) {
  try {
    const userId = formData.get('userId') as string;
    if (!userId) throw new Error('User ID is required');

    let imageUrl = formData.get('currentImageUrl') as string;
    let imagePath = formData.get('currentImagePath') as string;

    // Handle image upload if there's a new file
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      const result = await uploadImageToSupabase(imageFile, imagePath);
      imageUrl = result.url;
      imagePath = result.path;
    }

    const profileData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phoneNumber: formData.get('phoneNumber'),
      description: formData.get('description'),
      profilePicture: imageUrl,
      imagePath: imagePath,
      facebookLink: formData.get('facebookLink'),
      tiktokLink: formData.get('tiktokLink'),
      twitterLink: formData.get('twitterLink'),
      telegramLink: formData.get('telegramLink'),
    };

    const { error } = await supabase
      .from('guide_profiles')
      .update(profileData)
      .eq('userId', userId);

    if (error) throw error;

    revalidatePath('/guide/profile');
    return { message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error: 'Failed to update profile' };
  }
}

export async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('guide_profiles')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}