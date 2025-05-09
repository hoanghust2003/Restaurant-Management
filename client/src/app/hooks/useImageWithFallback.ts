'use client';

import { useState, useEffect } from 'react';

interface UseImageWithFallbackOptions {
  fallbackSrc: string;
}

export function useImageWithFallback(src: string | null | undefined, options: UseImageWithFallbackOptions) {
  const { fallbackSrc } = options;
  const [imageUrl, setImageUrl] = useState<string>(fallbackSrc);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (src) {
      // Reset states when src changes
      setError(false);
      setLoaded(false);
      
      try {
        // If it's already an absolute URL (starts with http or https), use it directly
        if (src.startsWith('http://') || src.startsWith('https://')) {
          setImageUrl(src);
          return;
        }

        // If it's a local path starting with /uploads
        if (src.startsWith('/uploads')) {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
          const baseUrl = API_BASE_URL.replace('/api', '');

          // Extract filename and folder from path
          const parts = src.split('/');
          if (parts.length > 2) {
            const folder = parts[2]; // e.g., 'avatars'
            const filename = parts[parts.length - 1];
            setImageUrl(`${baseUrl}/assets/${folder}/${filename}`);
          } else {
            // Fallback to original path
            setImageUrl(`${baseUrl}${src}`);
          }
          return;
        }
        
        // If it's any other path, use as is
        setImageUrl(src);
      } catch (err) {
        console.error('Error processing image URL:', err);
        setImageUrl(fallbackSrc);
        setError(true);
      }
    } else {
      setImageUrl(fallbackSrc);
    }
  }, [src, fallbackSrc]);

  const handleError = () => {
    console.error('Image failed to load:', imageUrl);
    setError(true);
    setLoaded(false);
    
    // If the current URL is already the fallback, try a more reliable fallback
    if (imageUrl === fallbackSrc) {
      // Data URI fallback that's guaranteed to work
      const dataURIFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
      setImageUrl(dataURIFallback);
    } else {
      setImageUrl(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  return { imageUrl, error, loaded, handleError, handleLoad };
}
