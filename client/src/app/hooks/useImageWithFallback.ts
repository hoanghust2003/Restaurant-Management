'use client';

import { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/image-url';
import { IMAGE_FALLBACKS, SVG_PLACEHOLDER } from '../utils/image-fallbacks';

interface UseImageWithFallbackOptions {
  fallbackSrc?: string;
  type?: 'dishes' | 'avatars' | 'menus';
}

export function useImageWithFallback(src: string | null | undefined, options: UseImageWithFallbackOptions = {}) {
  const { type = 'dishes' } = options;
  const fallbackSrc = options.fallbackSrc || IMAGE_FALLBACKS[type];
  const [imageUrl, setImageUrl] = useState<string>(fallbackSrc);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (src) {
      // Reset states when src changes
      setError(false);
      setLoaded(false);
      
      try {
        // Use the centralized image URL utility
        const processedUrl = getImageUrl(src, type);
        setImageUrl(processedUrl);
        console.debug(`Image URL processed: ${processedUrl}`);
      } catch (err) {
        console.error('Error processing image URL:', err);
        setImageUrl(fallbackSrc);
        setError(true);
      }
    } else {
      setImageUrl(fallbackSrc);
    }
  }, [src, fallbackSrc, type]);

  const handleError = () => {
    console.error('Image failed to load:', imageUrl);
    setError(true);
    setLoaded(false);
    
    // If the current URL is already the fallback, try a more reliable fallback
    if (imageUrl === fallbackSrc) {
      // Data URI fallback that's guaranteed to work
      setImageUrl(SVG_PLACEHOLDER);
    } else {
      setImageUrl(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  return { imageUrl, error, loaded, handleError, handleLoad };
}
