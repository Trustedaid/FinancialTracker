/**
 * Color utilities for handling color contrast and accessibility
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 guidelines
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine if a color is considered "light" or "dark"
 * Returns true if the color is light (should use dark text)
 */
export function isLightColor(hexColor: string): boolean {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return true; // Default to light if can't parse
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5;
}

/**
 * Get appropriate text color (white or black) for a given background color
 * to ensure good contrast and accessibility
 */
export function getContrastTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#1F2937' : '#FFFFFF'; // gray-800 : white
}

/**
 * Get text color with enhanced contrast for better readability
 * Returns darker/lighter variants for improved accessibility
 */
export function getHighContrastTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#111827' : '#F9FAFB'; // gray-900 : gray-50
}

/**
 * Determine if sufficient contrast exists between background and text colors
 * Based on WCAG AA standards (4.5:1 ratio)
 */
export function hasGoodContrast(backgroundColor: string, textColor: string): boolean {
  const ratio = getContrastRatio(backgroundColor, textColor);
  return ratio >= 4.5;
}

/**
 * Create a slightly transparent version of a color for hover effects
 */
export function getHoverColor(hexColor: string, opacity: number = 0.8): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}