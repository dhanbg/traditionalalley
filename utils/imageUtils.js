import { API_URL } from "./urls";

/**
 * Constructs a proper image URL, avoiding duplicate domain prefixes
 * @param {string} imageUrl - The image URL from the API
 * @returns {string} - The properly formatted image URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  
  // Convert to string if it's not already
  const urlString = typeof imageUrl === 'string' ? imageUrl : String(imageUrl);
  
  // If the URL already starts with http/https, return as is
  if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
    return urlString;
  }
  
  // If the path points to Strapi uploads, prepend API_URL
  if (urlString.startsWith('/uploads/')) {
    return `${API_URL}${urlString}`;
  }

  // Otherwise, treat as a local public asset path and return unchanged
  return urlString;
};

/**
 * Gets the best available image URL from a Strapi image object
 * @param {Object} imgSrc - The image object from Strapi
 * @param {string} preferredFormat - Preferred format (thumbnail, small, medium, large)
 * @returns {string} - The properly formatted image URL
 */
export const getBestImageUrl = (imgSrc, preferredFormat = 'medium') => {
  if (!imgSrc) return "";
  
  // If it's already a string, just pass it to getImageUrl
  if (typeof imgSrc === 'string') {
    return getImageUrl(imgSrc);
  }

  // Handle Strapi 5 array-wrapped media
  const target = Array.isArray(imgSrc) ? imgSrc[0] : imgSrc;
  if (!target) return "";

  let imageUrl = "";
  
  // Handle data.attributes structure (Strapi 4)
  const data = target.data?.attributes ? target.data.attributes : target;
  
  // Try to get the preferred format first
  if (data.formats && data.formats[preferredFormat]) {
    imageUrl = data.formats[preferredFormat].url;
  }
  // Fall back to other formats
  else if (data.formats) {
    if (data.formats.medium) imageUrl = data.formats.medium.url;
    else if (data.formats.small) imageUrl = data.formats.small.url;
    else if (data.formats.thumbnail) imageUrl = data.formats.thumbnail.url;
    else if (data.formats.large) imageUrl = data.formats.large.url;
  }
  // Fall back to the main URL
  else if (data.url) {
    imageUrl = data.url;
  }
  
  return getImageUrl(imageUrl);
};
