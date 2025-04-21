import { API_URL, STRAPI_API_TOKEN } from "./urls"

// Helper function to construct proper image URLs
export const getImageUrl = (imageObj) => {
  // Default placeholder that's built into Next.js
  const defaultPlaceholder = "/vercel.svg";
  
  if (!imageObj) return defaultPlaceholder;
  
  // Handle the case where the URL is already a full URL
  if (imageObj.url && imageObj.url.startsWith("http")) {
    return imageObj.url;
  }
  
  // Handle the structure where URL is directly in the object
  if (imageObj.url) {
    return `${API_URL}${imageObj.url}`;
  }
  
  // Handle the structure from the sample data
  if (imageObj && typeof imageObj === 'object') {
    // Try to get image URL from the formats.small path
    if (imageObj.formats && imageObj.formats.small && imageObj.formats.small.url) {
      return `${API_URL}${imageObj.formats.small.url}`;
    }
    
    // Try to get image URL from the formats.thumbnail path
    if (imageObj.formats && imageObj.formats.thumbnail && imageObj.formats.thumbnail.url) {
      return `${API_URL}${imageObj.formats.thumbnail.url}`;
    }
    
    // Try the main URL if formats not available or don't have URLs
    if (imageObj.url) {
      return `${API_URL}${imageObj.url}`;
    }
  }
  
  // Return placeholder if no valid URL found
  return defaultPlaceholder;
}

export const fetchDataFromApi = async (endpoint) => {
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
  }

  try {
    // Make sure the endpoint is properly encoded for any special characters
    // Only encode the part after the query params to avoid double-encoding the ? and = characters
    let processedEndpoint = endpoint;
    if (endpoint.includes('?')) {
      const [basePath, queryString] = endpoint.split('?');
      // Split by & to process each param individually
      const queryParams = queryString.split('&').map(param => {
        const [key, value] = param.split('=');
        // Only encode the value part, not the key or operators
        if (value.includes('[') || value.includes(']')) {
          // Don't encode operators like [$eq]
          return param;
        } else {
          return `${key}=${encodeURIComponent(value)}`;
        }
      });
      processedEndpoint = `${basePath}?${queryParams.join('&')}`;
    }

    console.log(`Fetching from: ${API_URL}${processedEndpoint}`);
    const res = await fetch(`${API_URL}${processedEndpoint}`, options);
    
    if (!res.ok) {
      // Try to read the error response body
      const errorBody = await res.text();
      let errorDetail;
      
      try {
        errorDetail = JSON.parse(errorBody);
      } catch (e) {
        errorDetail = errorBody;
      }
      
      console.error(`API request failed with status ${res.status}: ${res.statusText}`);
      console.error(`Request was to: ${API_URL}${processedEndpoint}`);
      
      const error = new Error(`HTTP error! status: ${res.status}`);
      error.status = res.status;
      error.detail = errorDetail;
      throw error;
    }
    
    return res.json();
  } catch (error) {
    console.error("API Error:", error);
    if (error.status) {
      console.error("Status:", error.status);
      console.error("Detail:", error.detail);
    }
    throw error;
  }
}

export const createData = async (endpoint, data) => {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }

  console.log(`API Request to ${API_URL}${endpoint}:`, options);
  
  try {
    const res = await fetch(`${API_URL}${endpoint}`, options)
    
    if (!res.ok) {
      // Try to read the error response body
      const errorBody = await res.text();
      let errorDetail;
      
      try {
        errorDetail = JSON.parse(errorBody);
      } catch (e) {
        errorDetail = errorBody;
      }
      
      const error = new Error(`Create failed: ${res.statusText}`);
      error.status = res.status;
      error.detail = errorDetail;
      throw error;
    }
    
    return res.json()
  } catch (error) {
    console.error("API Error:", error);
    console.error("Status:", error.status);
    console.error("Detail:", error.detail);
    throw error;
  }
}

export const updateData = async (endpoint, data) => {
  console.log(`API: updateData called for endpoint ${endpoint}`);
  
  const options = {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  console.log(`API: Update request to ${API_URL}${endpoint}`, {
    method: options.method,
    headers: options.headers,
    body: data
  });
  
  try {
    // Send the request
    const res = await fetch(`${API_URL}${endpoint}`, options);
    console.log(`API: Response status: ${res.status}`);
    
    // Get the response text for logging
    const responseText = await res.text();
    
    // Try to parse the response as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log(`API: Response data:`, responseData);
    } catch (parseError) {
      console.log(`API: Response is not JSON:`, responseText);
    }
    
    // Check if the request was successful
    if (!res.ok) {
      console.error(`API: Update failed with status ${res.status}: ${res.statusText}`);
      console.error(`API: Request was to: ${API_URL}${endpoint}`);
      console.error(`API: Request body was:`, data);
      console.error(`API: Response was:`, responseText);
      
      const error = new Error(`Update failed: ${res.statusText}`);
      error.status = res.status;
      error.detail = responseData || responseText;
      error.url = `${API_URL}${endpoint}`;
      throw error;
    }
    
    return responseData;
  } catch (error) {
    console.error("API: Update Error:", error);
    if (error.status) {
      console.error("API: Status:", error.status);
      console.error("API: Detail:", error.detail);
    }
    throw error;
  }
}

export const deleteData = async (endpoint) => {
  console.log(`API: deleteData called for endpoint ${endpoint}`);
  
  // Make sure the endpoint is properly formatted
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const options = {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  };

  console.log(`API: Delete request to ${API_URL}${cleanEndpoint}`, {
    method: options.method,
    headers: options.headers
  });
  
  try {
    // Send the request
    const res = await fetch(`${API_URL}${cleanEndpoint}`, options);
    console.log(`API: Delete response status: ${res.status}`);
    
    // Get the response text for logging
    let responseText;
    try {
      responseText = await res.text();
      console.log(`API: Delete response:`, responseText || "No response body");
    } catch (textError) {
      console.log(`API: Could not get response text:`, textError);
    }
    
    // Try to parse as JSON if possible
    let responseData;
    if (responseText) {
      try {
        responseData = JSON.parse(responseText);
        console.log(`API: Delete response data:`, responseData);
      } catch (parseError) {
        console.log(`API: Delete response is not JSON`);
      }
    }
    
    // Check if the request was successful
    if (!res.ok) {
      console.error(`API: Delete failed with status ${res.status}: ${res.statusText}`);
      console.error(`API: Delete request was to: ${API_URL}${cleanEndpoint}`);
      
      const error = new Error(`Delete failed: ${res.statusText}`);
      error.status = res.status;
      error.detail = responseData || responseText;
      error.url = `${API_URL}${cleanEndpoint}`;
      throw error;
    }
    
    return { success: true, message: "Deleted successfully", data: responseData };
  } catch (error) {
    console.error("API: Delete Error:", error);
    if (error.status) {
      console.error("API: Delete Status:", error.status);
      console.error("API: Delete Detail:", error.detail);
    }
    throw error;
  }
}

// Function to log the current user's clerk ID and fetch cart data
export const getCurrentUserCart = async (user) => {
  if (!user) {
    console.log("No user is logged in");
    return null;
  }
  
  try {
    // Log the clerk ID of the logged-in user
    console.log("Current logged-in user's Clerk ID:", user.id);
    
    // Fetch cart data from the endpoint
    const cartData = await fetchDataFromApi(`/api/carts?populate=*&filters[clerkUserId][$eq]=${user.id}`);
    
    // Log the cart data for debugging
    console.log("User's cart data:", cartData);
    
    return cartData;
  } catch (error) {
    console.error("Error fetching current user's cart:", error);
    return null;
  }
}