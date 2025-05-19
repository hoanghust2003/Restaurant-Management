/**
 * Utility for generating proper image URLs across the application
 */
import { IMAGE_FALLBACKS } from './image-fallbacks';

/**
 * Get the complete image URL for an asset
 * @param imagePath The image path or URL
 * @param type The type of asset (dishes, avatars, etc.)
 * @returns A proper URL to the image
 */
export function getImageUrl(imagePath?: string | null, type: 'dishes' | 'avatars' | 'menus' = 'dishes'): string {
  // If no image path, return the default image
  if (!imagePath) {
    return IMAGE_FALLBACKS[type];
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  
  // If it's an assets path (new format for static asset controller)
  if (imagePath.includes('assets/')) {
    return `${API_BASE_URL}/${imagePath}`;
  }
  
  // If it's a path starting with /uploads (old format)
  if (imagePath.startsWith('/uploads/')) {
    const parts = imagePath.split('/');
    if (parts.length > 2) {
      const folder = parts[2]; // e.g., 'dishes'
      const filename = parts[parts.length - 1];
      return `${API_BASE_URL}/assets/${folder}/${filename}`;
    }
  }
  
  // If it's just a filename, assume it's in the correct asset folder
  if (!imagePath.includes('/')) {
    return `${API_BASE_URL}/assets/${type}/${imagePath}`;
  }
  
  // For any other paths, add the API_BASE_URL
  const path = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `${API_BASE_URL}/${path}`;
}
