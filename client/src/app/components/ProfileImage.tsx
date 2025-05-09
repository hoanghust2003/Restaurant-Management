'use client';

import { useState, useEffect } from 'react';
import { ImageProps } from 'next/image';
import { UserIcon } from '@heroicons/react/24/outline';

interface ProfileImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
  className?: string;
  size?: number; // For convenience when you want a square image
  showPlaceholder?: boolean;
}

export default function ProfileImage({
  src,
  fallbackSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E", // SVG data URI fallback
  alt = 'Profile image',
  className = 'w-full h-full object-cover',
  width: propWidth,
  height: propHeight,
  size,
  showPlaceholder = true,
  ...rest
}: ProfileImageProps) {
  const width = size || propWidth || 64;
  const height = size || propHeight || 64;
  
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
        }        // If it's a local path starting with /uploads
        if (src.startsWith('/uploads')) {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

          // Extract filename and folder from path
          const parts = src.split('/');
          if (parts.length > 2) {
            const folder = parts[2]; // e.g., 'avatars'
            const filename = parts[parts.length - 1];
            setImageUrl(`${API_BASE_URL}/assets/${folder}/${filename}`);
          } else {
            // Fallback to original path
            setImageUrl(`${API_BASE_URL}${src}`);
          }
          return;
        }
        
        // If it's any other path, use as is (this includes paths like /default-avatar.png)
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
  // Handle image loading error
  const handleError = () => {
    console.error('Image failed to load:', imageUrl);
    setError(true);
    setLoaded(false);
    
    // Always use a data URI as fallback when an image fails to load
    // This ensures we never have a broken image
    const dataURIFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
    setImageUrl(dataURIFallback);
  };

  // Handle successful image load
  const handleLoad = () => {
    setLoaded(true);
  };
  
  // If no src provided and showPlaceholder is true, show the placeholder
  if (!src && showPlaceholder) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <UserIcon className="w-1/2 h-1/2 text-gray-400" />
      </div>
    );
  }
    return (
    <div className="relative">
      {!loaded && showPlaceholder && (
        <div className={`bg-gray-200 flex items-center justify-center absolute inset-0 ${className}`}>
          <UserIcon className="w-1/2 h-1/2 text-gray-400" />
        </div>
      )}
      
      {/* Always use regular img tag instead of Next.js Image component to avoid domain config issues */}
      <img
        src={imageUrl}
        alt={alt}
        className={`${className} ${!loaded ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onError={handleError}
        onLoad={handleLoad}
        width={width}
        height={height}
        loading="lazy"
      />
    </div>
  );
}
