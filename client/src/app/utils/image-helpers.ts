'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ImageHelperOptions {
  /**
   * Type of asset (e.g., 'avatars', 'dishes', etc.)
   */
  type: 'avatars' | 'dishes' | 'other';
  /**
   * Default fallback image URL
   */
  fallback?: string;
  /**
   * Width for image sizing
   */
  width?: number;
  /**
   * Height for image sizing
   */
  height?: number;
}

/**
 * Helper function to generate the correct URL for uploaded images
 * Takes into account the different storage methods (local vs S3)
 */
export const getImageUrl = (
  url: string | undefined, 
  options: ImageHelperOptions = { type: 'avatars', fallback: '/default-avatar.png' }
): string => {
  if (!url) {
    return options.fallback || '/default-avatar.png';
  }

  // If it's an absolute URL (starts with http or https), use it directly
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a local path starting with /uploads
  if (url.startsWith('/uploads')) {
    // Extract filename from path
    const parts = url.split('/');
    const filename = parts[parts.length - 1];

    // Return the URL using the assets controller endpoints
    return `${API_BASE_URL.replace('/api', '')}/assets/${options.type}/${filename}`;
  }

  // For other local paths (uncommon), prepend with API base URL
  return `${API_BASE_URL.replace('/api', '')}${url}`;
};

/**
 * Custom hook for managing image loading and errors
 */
export const useImage = (
  url: string | undefined, 
  options: ImageHelperOptions = { type: 'avatars', fallback: '/default-avatar.png' }
) => {
  const [imageUrl, setImageUrl] = useState<string>(getImageUrl(url, options));
  const [loading, setLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const newUrl = getImageUrl(url, options);
    setImageUrl(newUrl);
    setLoading(!!url);
    setError(false);
  }, [url, options]);

  const handleError = () => {
    setError(true);
    setLoading(false);
    setImageUrl(options.fallback || '/default-avatar.png');
  };

  const handleLoad = () => {
    setLoading(false);
  };

  return { imageUrl, loading, error, handleError, handleLoad };
};
