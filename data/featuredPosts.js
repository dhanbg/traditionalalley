// Featured posts from external sources showcasing Traditional Alley brand mentions
// Placeholder path: /c:/Users/Administrator/Documents/projects/t/traditionalalley/components/blogs/
// Placeholder URL: https://kathmandupost.com/fashion/2025/02/17/the-revival-of-nepali-dhaka

export const featuredPosts = [
  {
    id: 'kathmandu-post-dhaka-revival',
    title: 'The revival of Nepali Dhaka',
    excerpt: 'If there\'s one fabric that can be associated with Nepal\'s fashion identity, it is Dhaka. Traditional Alley is among the brands making this heritage fabric more accessible and trendy for modern consumers, bridging the gap between cultural heritage and contemporary fashion.',
    thumbnail: 'https://assets-api.kathmandupost.com/thumb.php?src=https://assets-cdn.kathmandupost.com/uploads/source/news/2025/third-party/DHAKAMAIN-1739754089.jpg&w=900&height=601',
    originalUrl: 'https://kathmandupost.com/fashion/2025/02/17/the-revival-of-nepali-dhaka',
    source: 'Kathmandu Post',
    publishedDate: 'February 17, 2025',
    author: 'The Kathmandu Post',
    brandMention: 'Traditional Alley is among the brands making this heritage fabric more accessible and trendy for modern consumers.',
    category: 'Fashion',
    tags: ['Dhaka', 'Traditional Fashion', 'Nepal', 'Heritage', 'Modern Fashion'],
    featured: true,
    readTime: '5 min read'
  },
  {
    id: 'buzz-nepal-renu-shrestha',
    title: 'Renu Shrestha and the Rise of Traditional Alley',
    excerpt: 'Where tradition meets innovation: The bold, grounded vision of Renu Shrestha. Her brand Traditional Alley isn\'t just about designing pretty clothes, it\'s a grounded, intentional movement to preserve Nepal\'s textile legacy while keeping pace with the demands of a modern wardrobe.',
    thumbnail: 'https://thebuzznepal.com/wp-content/uploads/2025/07/cover-21.png',
    originalUrl: 'https://thebuzznepal.com/renu-shrestha-and-the-rise-of-traditional-alley/',
    source: 'The Buzz Nepal',
    publishedDate: 'July 18, 2025',
    author: 'The Buzz Nepal',
    brandMention: 'Traditional Alley: a label that married Nepali craftsmanship with accessible, globally aware design.',
    category: 'Profile',
    tags: ['Traditional Alley', 'Renu Shrestha', 'Fashion Design', 'Nepal', 'Entrepreneurship'],
    featured: true,
    readTime: '6 min read'
  }
  // Add more featured posts here as they become available
  // Example:
  // {
  //   id: 'example-post-2',
  //   title: 'Another Featured Article',
  //   excerpt: 'Brief description mentioning Traditional Alley...',
  //   thumbnail: '/images/blog/featured-example.jpg',
  //   originalUrl: 'https://example.com/article',
  //   source: 'Example Publication',
  //   publishedDate: 'Date',
  //   author: 'Author Name',
  //   brandMention: 'How Traditional Alley was mentioned...',
  //   category: 'Category',
  //   tags: ['tag1', 'tag2'],
  //   featured: true,
  //   readTime: 'X min read'
  // }
];

// Helper function to get all featured posts
export const getAllFeaturedPosts = () => {
  return featuredPosts;
};

// Helper function to get featured post by ID
export const getFeaturedPostById = (id) => {
  return featuredPosts.find(post => post.id === parseInt(id));
};

// Helper function to get recent featured posts
export const getRecentFeaturedPosts = (limit = 5) => {
  return featuredPosts.slice(0, limit);
};