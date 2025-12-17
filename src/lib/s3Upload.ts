import { supabase } from '@/integrations/supabase/client';

interface S3UploadResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export async function getSignedUploadUrl(
  fileName: string,
  contentType: string
): Promise<S3UploadResponse> {
  const { data, error } = await supabase.functions.invoke('s3-upload', {
    body: { fileName, contentType },
  });

  if (error) {
    throw new Error(error.message || 'Failed to get upload URL');
  }

  return data as S3UploadResponse;
}

export async function uploadToS3(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only images are allowed.');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  // Get signed URL
  const { uploadUrl, publicUrl } = await getSignedUploadUrl(file.name, file.type);

  // Upload to S3
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to upload file to S3');
  }

  return publicUrl;
}
