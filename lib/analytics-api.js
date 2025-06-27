const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

const headers = {
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json'
};

// Generic API call function
export const fetchFromStrapi = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}/api/${endpoint}`;
    const response = await fetch(url, {
      headers,
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
};

// Specific API functions for analytics
export const analyticsAPI = {
  // Products
  getProducts: () => fetchFromStrapi('products?populate=*'),
  getProductById: (id) => fetchFromStrapi(`products/${id}?populate=*`),
  
  // Users/Customers
  getUsers: () => fetchFromStrapi('user-datas?populate=*'),
  getUserById: (id) => fetchFromStrapi(`user-datas/${id}?populate=*`),
  
  // Carts (representing orders/sales)
  getCarts: () => fetchFromStrapi('carts?populate=*'),
  getCartsByUser: (userId) => fetchFromStrapi(`carts?filters[user_datum][id][$eq]=${userId}&populate=*`),
  
  // Reviews
  getReviews: () => fetchFromStrapi('customer-reviews?populate=*'),
  getReviewsByProduct: (productId) => fetchFromStrapi(`customer-reviews?filters[product][id][$eq]=${productId}&populate=*`),
  
  // Collections/Categories
  getCollections: () => fetchFromStrapi('collections?populate=*'),
  getCategories: () => fetchFromStrapi('categories?populate=*'),
  
  // User Bags (shipping/orders)
  getUserBags: () => fetchFromStrapi('user-bags?populate=*'),
  
  // Analytics aggregations
  getSalesAnalytics: async () => {
    const [products, carts, collections] = await Promise.all([
      analyticsAPI.getProducts(),
      analyticsAPI.getCarts(),
      analyticsAPI.getCollections()
    ]);
    
    return {
      products: products.data || [],
      carts: carts.data || [],
      collections: collections.data || []
    };
  },
  
  getCustomerAnalytics: async () => {
    const [users, carts, reviews] = await Promise.all([
      analyticsAPI.getUsers(),
      analyticsAPI.getCarts(),
      analyticsAPI.getReviews()
    ]);
    
    return {
      users: users.data || [],
      carts: carts.data || [],
      reviews: reviews.data || []
    };
  },
  
  getProductAnalytics: async () => {
    const [products, carts, reviews, collections] = await Promise.all([
      analyticsAPI.getProducts(),
      analyticsAPI.getCarts(),
      analyticsAPI.getReviews(),
      analyticsAPI.getCollections()
    ]);
    
    return {
      products: products.data || [],
      carts: carts.data || [],
      reviews: reviews.data || [],
      collections: collections.data || []
    };
  },
  
  getShippingAnalytics: async () => {
    const [userBags, carts] = await Promise.all([
      analyticsAPI.getUserBags(),
      analyticsAPI.getCarts()
    ]);
    
    return {
      userBags: userBags.data || [],
      carts: carts.data || []
    };
  }
};

// Utility functions for data processing
export const analyticsUtils = {
  // Calculate revenue from user-bag.user_orders.payments (successful payments only)
  calculateRevenue: (userBags) => {
    let totalRevenue = 0;
    
    userBags.forEach(userBag => {
      const userOrders = userBag.user_orders || {};
      const payments = userOrders.payments || [];
      
      payments.forEach(payment => {
        if (payment.status === 'Success') {
          totalRevenue += payment.amount || 0;
        }
      });
    });
    
    return totalRevenue;
  },

  // Calculate revenue from cart data (legacy method - kept for compatibility)
  calculateRevenueFromCarts: (carts) => {
    return carts.reduce((total, cart) => {
      const product = cart.attributes?.product?.data;
      if (product) {
        return total + (product.attributes.price * cart.attributes.quantity);
      }
      return total;
    }, 0);
  },
  
  // Group data by a specific field
  groupBy: (array, key) => {
    return array.reduce((result, item) => {
      const group = item.attributes?.[key] || 'Unknown';
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {});
  },
  
  // Calculate average rating
  calculateAverageRating: (reviews) => {
    if (!reviews.length) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + (review.attributes?.rating || 0), 0);
    return totalRating / reviews.length;
  },
  
  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount);
  },
  
  // Calculate percentage
  calculatePercentage: (value, total) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  },
  
  // Generate date range data (mock function for trends)
  generateDateRange: (days = 30) => {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }
};

export default analyticsAPI; 