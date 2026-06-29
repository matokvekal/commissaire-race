/**
 * Color Utilities
 * Provides functions for color manipulation, contrast checking, and text color selection
 */

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate luminance of a color (0-255)
 * Based on relative luminance formula from WCAG
 */
export function getColorLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 128; // Default to mid-brightness if parsing fails

  // Convert to sRGB
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  // Apply gamma correction
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  const luminance = 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
  return luminance * 255;
}

/**
 * Get contrasting text color (white or black) based on background color
 * Uses luminance to determine if dark text or light text is more readable
 */
export function getContrastTextColor(bgColor: string | null): string {
  if (!bgColor) return "#333333"; // Default dark text
  
  try {
    const luminance = getColorLuminance(bgColor);
    // If background is bright (luminance > 128), use dark text, otherwise use light text
    return luminance > 128 ? "#1a1a1a" : "#ffffff";
  } catch {
    return "#333333"; // Default if calculation fails
  }
}

/**
 * Get a slightly darker or lighter version of a color for hover states
 */
export function adjustColorBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.max(0, Math.min(255, Math.round(rgb.r * (1 + percent / 100))));
  const g = Math.max(0, Math.min(255, Math.round(rgb.g * (1 + percent / 100))));
  const b = Math.max(0, Math.min(255, Math.round(rgb.b * (1 + percent / 100))));

  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

/**
 * Default color palette for categories
 */
export const DEFAULT_CATEGORY_COLORS = [
  "#63A6FC", // Blue
  "#3EDC4F", // Green
  "#FF6B6B", // Red
  "#FFD93D", // Yellow
  "#A78BFA", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#8B5CF6", // Violet
  "#14B8A6", // Teal
];

/**
 * Get a random color from the default palette
 */
export function getRandomColor(): string {
  return DEFAULT_CATEGORY_COLORS[Math.floor(Math.random() * DEFAULT_CATEGORY_COLORS.length)];
}
