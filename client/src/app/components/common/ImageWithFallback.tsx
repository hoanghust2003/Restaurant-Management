'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc: string;
  maxRetries?: number;
}

/**
 * Enhanced Image component that handles loading failures gracefully
 * - Uses fallback image when the original fails to load
 * - Implements retry mechanism with limits to avoid excessive network requests
 * - Prevents console errors from failed image loads
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  alt,
  maxRetries = 1, // Default to just one retry attempt
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState<string>(fallbackSrc);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track whether the component is still mounted
  const [isMounted, setIsMounted] = useState(true);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Check if the src is valid
  useEffect(() => {
    // Reset states when src changes
    if (isMounted) {
      setIsLoading(true);
      setRetryCount(0);
      setHasError(false);
    }
    
    // Convert StaticImport to string if needed
    const srcString = typeof src === 'string' ? src : '';
    
    // If no src or it's an empty string, use fallback immediately
    if (!srcString || srcString.trim() === '') {
      if (isMounted) {
        setImgSrc(fallbackSrc);
        setHasError(true);
        setIsLoading(false);
      }
      return;
    }

    // Check if src is valid
    try {
      // Only set the image source if we have a valid-looking URL
      if (srcString.startsWith('http') || srcString.startsWith('/')) {
        if (isMounted) {
          setImgSrc(srcString);
        }
      } else {
        // Invalid URL format, use fallback
        if (isMounted) {
          setImgSrc(fallbackSrc);
          setHasError(true);
          setIsLoading(false);
        }
      }
    } catch (e) {
      if (isMounted) {
        setImgSrc(fallbackSrc);
        setHasError(true);
        setIsLoading(false);
      }
    }
  }, [src, fallbackSrc, isMounted]);

  const handleLoad = () => {
    if (isMounted) {
      setIsLoading(false);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.preventDefault(); // Prevent default error handling
    
    if (!isMounted) return;
    
    // If we haven't exceeded max retries, try again with exponential backoff
    if (retryCount < maxRetries && !hasError && imgSrc !== fallbackSrc) {
      setRetryCount(prev => prev + 1);
      
      // Use exponential backoff (500ms, 1000ms, 2000ms, etc.)
      const retryDelay = Math.min(2000, 500 * Math.pow(2, retryCount));
      
      setTimeout(() => {
        if (isMounted) {
          // Force reload by setting a unique URL parameter
          const timestamp = new Date().getTime();
          const currentSrc = typeof imgSrc === 'string' ? imgSrc : '';
          const hasQueryParam = currentSrc.includes('?');
          setImgSrc(`${currentSrc}${hasQueryParam ? '&' : '?'}_retry=${timestamp}`);
        }
      }, retryDelay);
    } else {
      // Max retries exceeded or already using fallback, switch to fallback image
      setImgSrc(fallbackSrc);
      setHasError(true);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Image
        {...rest}
        src={imgSrc}
        alt={alt || 'Image'}
        onError={handleError}
        onLoad={handleLoad}
        style={{
          ...rest.style,
          opacity: isLoading ? 0.5 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
    </>
  );
};

export default ImageWithFallback;
