# NCM (Nepal Can Move) Integration Guide

## Overview
This integration allows your Traditional Alley e-commerce system to create and track delivery orders through Nepal Can Move's logistics API.

## Features Implemented
- ✅ Branch listing and selection
- ✅ Shipping rate calculation
- ✅ Order creation
- ✅ Order status tracking
- ✅ Order comments management
- ✅ Integration with existing order management system

## Setup Instructions

### 1. Environment Configuration
Add your NCM API token to your `.env` file:

```env
# NCM API Configuration
NCM_API_TOKEN=your_ncm_api_token_here
```

**Note:** Contact NCM IT Admin to get your API token if you don't have one.

### 2. API Endpoints Available

#### Frontend API Routes
- `GET /api/ncm/branches` - Get all NCM branches
- `GET /api/ncm/shipping-rate?from=BRANCH1&to=BRANCH2&type=Pickup` - Calculate shipping rates
- `POST /api/ncm/create-order` - Create new NCM order
- `GET /api/ncm/order-status?orderId=ID&type=details|status|comments` - Get order information
- `POST /api/ncm/add-comment` - Add comment to existing order

#### Backend Utilities
- `utils/ncm-api.js` - Core NCM API functions
- `components/NCMIntegration.js` - React component for NCM integration

### 3. Usage in Order Management

The NCM integration is automatically available in the Order Management dashboard:

1. **View Order Details**: Click "View Details" on any payment
2. **NCM Integration Panel**: Appears below payment details
3. **Create NCM Order**: 
   - Select pickup and destination branches
   - Calculate shipping rates (optional)
   - Click "Create NCM Order"
4. **Track Orders**: Once created, view status updates and add comments

### 4. Data Flow

```
Order Payment → NCM Integration Component → NCM API → Order Created
     ↓
User-bag Updated with NCM Order ID → Tracking Info Saved → Status Updates
```

### 5. API Rate Limits
- **Order Creation**: 200 per day
- **Order Views**: 5000 per day

### 6. Error Handling
The integration handles common errors:
- 400: Missing parameters
- 401: Authentication failed
- 404: Order not found
- 500: Server error

### 7. NCM Order Data Structure

When creating an NCM order, the following data is sent:
```json
{
  "name": "Customer Name",
  "phone": "Customer Phone",
  "phone2": "Alternate Phone (optional)",
  "cod_charge": "Total Amount",
  "address": "Delivery Address",
  "fbranch": "Pickup Branch",
  "branch": "Destination Branch",
  "package": "Package Description",
  "vref_id": "Your Order Reference ID",
  "instruction": "Delivery Instructions"
}
```

### 8. Tracking Information Storage

NCM order information is stored in the user-bag's `trackingInfo` field:
```json
{
  "trackingInfo": {
    "ncm": {
      "orderId": "NCM_ORDER_ID",
      "orderData": { /* NCM order details */ },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "status": "created"
    }
  }
}
```

## Testing

1. Ensure your NCM API token is configured
2. Navigate to Order Management dashboard
3. Select a payment and click "View Details"
4. Use the NCM Integration panel to create test orders
5. Monitor the console for API responses and errors

## Troubleshooting

### Common Issues

1. **"NCM API token not configured"**
   - Add `NCM_API_TOKEN` to your `.env` file

2. **"Failed to fetch NCM branches"**
   - Check your internet connection
   - Verify API token is correct
   - Check NCM API status

3. **"Invalid Branch" error**
   - Ensure branch names match exactly with NCM system
   - Use the branch dropdown to select valid branches

4. **Rate limit exceeded**
   - Wait for the daily limit to reset
   - Monitor your API usage

### Debug Mode
Enable debug logging by adding to your `.env`:
```env
DEBUG_NCM=true
```

## Support
For NCM API issues, contact NCM IT Admin.
For integration issues, check the console logs and error messages.
