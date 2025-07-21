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
  
  // Otherwise, prepend the API_URL
  return `${API_URL}${urlString}`;
};

/**
 * Gets the best available image URL from a Strapi image object
 * @param {Object} imgSrc - The image object from Strapi
 * @param {string} preferredFormat - Preferred format (thumbnail, small, medium, large)
 * @returns {string} - The properly formatted image URL
 */
export const getBestImageUrl = (imgSrc, preferredFormat = 'medium') => {
  if (!imgSrc) return "";
  
  let imageUrl = "";
  
  // Try to get the preferred format first
  if (imgSrc.formats && imgSrc.formats[preferredFormat]) {
    imageUrl = imgSrc.formats[preferredFormat].url;
  }
  // Fall back to other formats
  else if (imgSrc.formats) {
    if (imgSrc.formats.medium) imageUrl = imgSrc.formats.medium.url;
    else if (imgSrc.formats.small) imageUrl = imgSrc.formats.small.url;
    else if (imgSrc.formats.thumbnail) imageUrl = imgSrc.formats.thumbnail.url;
    else if (imgSrc.formats.large) imageUrl = imgSrc.formats.large.url;
  }
  // Fall back to the main URL
  else if (imgSrc.url) {
    imageUrl = imgSrc.url;
  }
  // Handle data.attributes structure
  else if (imgSrc.data && imgSrc.data.attributes) {
    imageUrl = imgSrc.data.attributes.url;
  }
  
  return getImageUrl(imageUrl);
};
