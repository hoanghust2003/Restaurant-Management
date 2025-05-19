/**
 * Centralized image fallback configuration
 * This file provides constants for fallback images throughout the application
 */

export const IMAGE_FALLBACKS = {
  dishes: '/images/default-dish.png',
  avatars: '/default-avatar.png',
  menus: '/images/default-menu.png',
};

/**
 * SVG data URI for a generic placeholder icon
 * Used as the ultimate fallback if even regular images fail to load
 */
export const SVG_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";

/**
 * Get the appropriate fallback image URL for a specific type
 * @param type The type of image (dishes, avatars, menus)
 * @returns The fallback image URL
 */
export function getFallbackImage(type: keyof typeof IMAGE_FALLBACKS = 'dishes'): string {
  return IMAGE_FALLBACKS[type];
}
