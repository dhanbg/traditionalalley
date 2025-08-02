/**
 * NCM (Nepal Can Move) API Integration
 * Provides functionality to interact with NCM's logistics API
 */

const NCM_BASE_URL = 'https://demo.nepalcanmove.com/api/v1';

/**
 * Make authenticated request to NCM API
 */
async function makeNCMRequest(endpoint, options = {}) {
  const token = process.env.NCM_API_TOKEN;
  
  if (!token) {
    throw new Error('NCM API token not configured');
  }

  const url = `${NCM_BASE_URL}${endpoint}`;
  const headers = {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`NCM API Error (${response.status}): ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('NCM API Request failed:', error);
    throw error;
  }
}

/**
 * Get list of all NCM branches with details
 */
export async function getAvailableBranches() {
  try {
    const response = await makeNCMRequest('/branchlist');
    console.log('Raw NCM branch response:', response);
    
    // Handle new response format: { data: "[[...], [...]]" }
    if (response && response.data && typeof response.data === 'string') {
      try {
        const parsedData = JSON.parse(response.data);
        if (Array.isArray(parsedData)) {
          return parsedData.map(item => ({
            name: item[0],
            code: item[1],
            municipality: item[3],
            district: item[4],
            region: item[5],
            phone: item[6]
          }));
        }
      } catch (e) {
        console.error('Failed to parse branch data:', e);
      }
    }
    
    if (response && response.success && Array.isArray(response.branches)) {
      return response.branches;
    }
  
    if (Array.isArray(response)) {
      return response;
    }
  
    if (typeof response === 'string') {
      try {
        const parsed = JSON.parse(response);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        if (parsed && Array.isArray(parsed.branches)) {
          return parsed.branches;
        }
      } catch (e) {
        // Not JSON
      }
      
      // Handle stringified array of arrays
      if (response.startsWith('[') && response.endsWith(']')) {
        try {
          const parsedArray = JSON.parse(response);
          if (Array.isArray(parsedArray)) {
            return parsedArray.map(item => {
              if (Array.isArray(item) && item.length >= 2) {
                return { id: item[0], name: item[1] };
              }
              return item;
            });
          }
        } catch (e) {
          console.error('Failed to parse stringified branch array:', e);
        }
      }
    }
  
    console.error('Unexpected branch response format:', response);
    throw new Error('Unexpected or invalid branch data format received from NCM API.');
  } catch (error) {
    console.error('Failed to fetch NCM branch list:', error);
    throw error;
  }
}

/**
 * Calculate delivery charges between branches
 */
export async function getDeliveryCharges(fromBranch, toBranch, type = 'Pickup') {
  try {
    const endpoint = `/shipping-rate?creation=${encodeURIComponent(fromBranch)}&destination=${encodeURIComponent(toBranch)}&type=${encodeURIComponent(type)}`;
    return await makeNCMRequest(endpoint);
  } catch (error) {
    console.error('Failed to fetch delivery charges:', error);
    throw error;
  }
}

/**
 * Get order details by NCM order ID
 */
export async function getOrderDetails(orderId) {
  try {
    const endpoint = `/order?id=${orderId}`;
    return await makeNCMRequest(endpoint);
  } catch (error) {
    console.error('Failed to fetch order details:', error);
    throw error;
  }
}

/**
 * Get order comments by NCM order ID
 */
export async function getOrderComments(orderId) {
  try {
    const endpoint = `/order/comment?id=${orderId}`;
    return await makeNCMRequest(endpoint);
  } catch (error) {
    console.error('Failed to fetch order comments:', error);
    throw error;
  }
}

/**
 * Get order status by NCM order ID
 */
export async function getOrderStatus(orderId) {
  try {
    const endpoint = `/order/status?id=${orderId}`;
    return await makeNCMRequest(endpoint);
  } catch (error) {
    console.error('Failed to fetch order status:', error);
    throw error;
  }
}

/**
 * Get last 25 order comments
 */
export async function getBulkOrderComments() {
  try {
    return await makeNCMRequest('/order/getbulkcomments');
  } catch (error) {
    console.error('Failed to fetch bulk order comments:', error);
    throw error;
  }
}

/**
 * Create a new NCM order
 */
export async function createNCMOrder(orderData) {
  try {
    const {
      name,
      phone,
      phone2 = '',
      cod_charge,
      address,
      fbranch,
      branch,
      package: packageName = '',
      vref_id = '',
      instruction = ''
    } = orderData;

    // Validate required fields
    if (!name || !phone || !cod_charge || !address || !fbranch || !branch) {
      throw new Error('Missing required fields for NCM order creation');
    }

    const payload = {
      name,
      phone,
      phone2,
      cod_charge: cod_charge.toString(),
      address,
      fbranch,
      branch,
      package: packageName,
      vref_id,
      instruction
    };

    return await makeNCMRequest('/order/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Failed to create NCM order:', error);
    throw error;
  }
}

/**
 * Add comment to an existing NCM order
 */
export async function addOrderComment(orderId, comment) {
  try {
    if (!orderId || !comment) {
      throw new Error('Order ID and comment are required');
    }

    const payload = {
      orderid: orderId.toString(),
      comments: comment
    };

    return await makeNCMRequest('/comment', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Failed to add order comment:', error);
    throw error;
  }
}

/**
 * Helper function to format NCM order data from your system's order
 */
export function formatOrderForNCM(order, customerInfo, shippingInfo) {
  return {
    name: customerInfo.name || `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
    phone: customerInfo.phone,
    phone2: customerInfo.alternatePhone || '',
    cod_charge: order.total || order.amount,
    address: shippingInfo.address || customerInfo.address,
    fbranch: shippingInfo.fromBranch || 'TINKUNE', // Default pickup branch
    branch: shippingInfo.toBranch,
    package: order.items?.map(item => item.name).join(', ') || 'Package',
    vref_id: order.id || order.orderId,
    instruction: shippingInfo.instruction || order.notes || ''
  };
}

/**
 * Get available NCM branches for dropdown/selection
 */
export async function getAvailableBranchesForDropdown() {
  try {
    const branches = await getAvailableBranches();
    return branches.map(branch => ({
      value: branch.name || branch.branch_name,
      label: `${branch.name || branch.branch_name} - ${branch.district || ''}`,
      district: branch.district,
      region: branch.region,
      phone: branch.phone,
      areas: branch.covered_areas
    }));
  } catch (error) {
    console.error('Failed to get available branches:', error);
    return [];
  }
}
