'use client';

import React from 'react';
import { useImageWithFallback } from '@/app/hooks/useImageWithFallback';
import NextImage, { ImageProps as NextImageProps } from 'next/image';

interface ImageWithFallbackProps extends Omit<NextImageProps, 'src'> {
  src?: string | null;
  type?: 'dishes' | 'avatars' | 'menus';
  fallbackSrc?: string;
}

export default function ImageWithFallback({
  src,
  type = 'dishes',
  fallbackSrc = type === 'dishes' 
    ? '/images/default-dish.png' 
    : type === 'menus' 
      ? '/images/default-menu.png' 
      : '/default-avatar.png',
  alt = '',
  width,
  height,
  className = '',
  ...props
}: ImageWithFallbackProps) {
  const { imageUrl, error, loaded, handleError, handleLoad } = useImageWithFallback(src, {
    fallbackSrc,
    type
  });

  return (
    <div className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <span className="sr-only">Loading...</span>
        </div>
      )}
      <NextImage
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
}
