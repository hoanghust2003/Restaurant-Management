/**
 * Format utility functions for displaying values in the application UI
 */

/**
 * Format a price value to Vietnamese currency format (VND)
 * @param price - The price value to format
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Format a date and time to a readable format
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format a date only (without time)
 * @param date - The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Format a quantity with the appropriate unit
 * @param quantity - The quantity value
 * @param unit - The unit of measurement
 * @returns Formatted quantity string
 */
export const formatQuantity = (quantity: number, unit?: string): string => {
  return `${quantity.toLocaleString('vi-VN')}${unit ? ` ${unit}` : ''}`;
};

/**
 * Truncate a long string and add ellipsis
 * @param text - The text to truncate
 * @param length - Maximum length before truncating
 * @returns Truncated text with ellipsis
 */
export const truncateText = (text: string, length: number = 30): string => {
  if (!text || text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};
