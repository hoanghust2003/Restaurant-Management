'use client';

import { ImageProps } from 'next/image';
import { UserIcon } from '@heroicons/react/24/outline';
import { useImageWithFallback } from '../hooks/useImageWithFallback';

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
}: ProfileImageProps) {
  const width = size || propWidth || 64;
  const height = size || propHeight || 64;
  
  const { imageUrl, loaded, handleError, handleLoad } = useImageWithFallback(src, {
    fallbackSrc,
    type: 'avatars'
  });
  
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
