import { supabase } from '@/app/supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadImageToSupabase(
  file: File,
  oldImagePath?: string | null
): Promise<{ path: string; url: string }> {
  try {
    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `guide-profiles/${fileName}`;

    // Upload new image
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    // Delete old image if it exists
    if (oldImagePath) {
      await supabase.storage
        .from('profiles')
        .remove([oldImagePath]);
    }

    return {
      path: filePath,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error in image upload:', error);
    throw new Error('Failed to upload image');
  }
}