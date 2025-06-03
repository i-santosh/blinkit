import { API_ROOT } from "~/lib/constants";

/**
 * Get the full URL for an image path
 * @param path Image path from the API (may be relative or full URL)
 * @returns Full URL to the image
 */
export function getImageUrl(path: string | null): string {
  if (!path) return '';
  
  // If the path already has a protocol (http or https), return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a relative path, append it to the API root
  return `${API_ROOT}${path}`;
} 