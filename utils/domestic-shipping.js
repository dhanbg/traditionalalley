// Utility functions for domestic shipping services

/**
 * Fetch domestic shipping rates and delivery information
 * @param {Object} params - Shipping parameters
 * @param {string} params.origin - Origin location
 * @param {string} params.destination - Destination location
 * @param {number} params.weight - Package weight in kg
 * @param {Object} params.dimensions - Package dimensions {length, width, height}
 * @returns {Promise<Object>} Shipping rates and delivery information
 */
export async function getDomesticShippingRates(params) {
  try {
    // Mock data structure based on Nepal Can Move services
    // In production, this would make actual API calls to https://www.nepalcanmove.com/
    const mockRates = {
      success: true,
      data: {
        services: [
          {
            id: 'home_delivery',
            name: 'Home Delivery',
            description: 'Door-to-door delivery service to most locations in Nepal',
            deliveryTime: '1-3 business days',
            rate: calculateDomesticRate(params, 'home'),
            features: [
              'Cash on Delivery available',
              'Real-time tracking',
              'Secure handling',
              'Insurance coverage'
            ]
          },
          {
            id: 'counter_delivery',
            name: 'Counter Delivery',
            description: 'Affordable pickup from our branch locations',
            deliveryTime: '1-2 business days',
            rate: calculateDomesticRate(params, 'counter'),
            features: [
              'Cost-effective option',
              'Multiple pickup locations',
              'Extended pickup hours',
              'SMS notifications'
            ]
          }
        ],
        coverage: {
          kathmandu: { available: true, deliveryTime: '1 day' },
          pokhara: { available: true, deliveryTime: '1-2 days' },
          chitwan: { available: true, deliveryTime: '1-2 days' },
          butwal: { available: true, deliveryTime: '2-3 days' },
          dharan: { available: true, deliveryTime: '2-3 days' },
          karnali: { available: true, deliveryTime: '3-5 days', note: 'Remote area delivery' },
          farWest: { available: true, deliveryTime: '3-5 days', note: 'Remote area delivery' }
        }
      }
    };

    return mockRates;
  } catch (error) {
    console.error('Error fetching domestic shipping rates:', error);
    return {
      success: false,
      error: 'Unable to fetch shipping rates at this time'
    };
  }
}

/**
 * Calculate domestic shipping rate based on parameters
 * @param {Object} params - Shipping parameters
 * @param {string} serviceType - Type of service (home/counter)
 * @returns {Object} Rate information
 */
function calculateDomesticRate(params, serviceType) {
  const baseRate = serviceType === 'home' ? 150 : 100; // Base rate in NPR
  const weightRate = params.weight * 50; // Per kg rate
  const total = baseRate + weightRate;

  return {
    currency: 'NPR',
    amount: total,
    breakdown: {
      baseRate,
      weightCharge: weightRate,
      total
    }
  };
}

/**
 * Get delivery coverage information for a specific location
 * @param {string} location - Location name
 * @returns {Object} Coverage information
 */
export function getDeliveryCoverage(location) {
  const coverageMap = {
    'kathmandu': { zone: 'Zone 1', deliveryTime: '1 day', available: true },
    'pokhara': { zone: 'Zone 1', deliveryTime: '1-2 days', available: true },
    'chitwan': { zone: 'Zone 2', deliveryTime: '1-2 days', available: true },
    'butwal': { zone: 'Zone 2', deliveryTime: '2-3 days', available: true },
    'dharan': { zone: 'Zone 2', deliveryTime: '2-3 days', available: true },
    'karnali': { zone: 'Zone 3', deliveryTime: '3-5 days', available: true, note: 'Remote area' },
    'farwest': { zone: 'Zone 3', deliveryTime: '3-5 days', available: true, note: 'Remote area' }
  };

  return coverageMap[location.toLowerCase()] || {
    zone: 'Standard',
    deliveryTime: '2-4 days',
    available: true
  };
}

/**
 * Get domestic shipping zones and their characteristics
 * @returns {Array} List of shipping zones
 */
export function getDomesticShippingZones() {
  return [
    {
      zone: 'Zone 1',
      name: 'Major Cities',
      locations: ['Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur'],
      deliveryTime: '1-2 days',
      description: 'Fast delivery to major urban centers'
    },
    {
      zone: 'Zone 2',
      name: 'Regional Centers',
      locations: ['Chitwan', 'Butwal', 'Dharan', 'Biratnagar', 'Nepalgunj'],
      deliveryTime: '2-3 days',
      description: 'Reliable delivery to regional hubs'
    },
    {
      zone: 'Zone 3',
      name: 'Remote Areas',
      locations: ['Karnali Province', 'Far Western Province', 'Mountain Districts'],
      deliveryTime: '3-5 days',
      description: 'Specialized delivery to remote and mountainous regions'
    }
  ];
}