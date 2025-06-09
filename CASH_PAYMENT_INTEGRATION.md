# Payment Order Integration

This document explains the implementation of both cash payment (COD) and Khalti payment order functionality in the Traditional Alley e-commerce application.

## Overview

The payment system supports two payment methods:
1. **Cash on Delivery (COD)** - Orders are saved immediately when user submits the form
2. **Khalti Payment** - Orders are saved during payment initiation and updated when payment is completed

Both payment methods capture the same order information and save it to the user's bag in the database.

## Implementation Details

### 1. Frontend Changes

#### Modified Components:
- `components/otherPages/Checkout.jsx` - Main checkout component with form handling and order submission
- `components/payments/KhaltiPaymentForm.tsx` - Khalti payment component with order data integration

#### Key Features Added:
- **Form State Management**: All form fields are now controlled components with state management
- **Form Validation**: Required field validation before order submission (both payment methods)
- **Payment Method Selection**: Radio buttons to choose between COD and Khalti
- **Order Data Preparation**: Consistent order data structure for both payment methods
- **Loading States**: UI feedback during order processing

#### Form Fields Captured:
- First Name (required)
- Last Name (required)
- Email Address (required)
- Phone Number (required)
- Country/Region
- Town/City (required)
- Street Address (required)
- State
- Postal Code
- Order Notes (optional)

### 2. Backend Integration

#### New API Functions:
- `utils/api.js` - Added `saveCashPaymentOrder()` function for COD orders
- `utils/api.js` - Added `saveKhaltiPaymentOrder()` function for Khalti orders
- `utils/useKhalti.ts` - Updated to handle order data during payment initiation

#### Data Structure:
Orders are saved in the `user_orders` field of the user's bag with the following structure:

**Cash Payment Order:**
```json
{
  "user_orders": {
    "2025-01-XX-TIMESTAMP": {
      "products": [
        {
          "size": "M",
          "color": "red",
          "discount": 10,
          "quantity": 2,
          "subtotal": 100,
          "unitPrice": 50,
          "documentId": "product-document-id",
          "finalPrice": 90
        }
      ],
      "shippingPrice": 5,
      "receiver_details": {
        "note": "Order notes",
        "email": "customer@example.com",
        "phone": "+1234567890",
        "address": {
          "city": "New York",
          "state": "NY",
          "street": "123 Main St",
          "country": "United States",
          "postalCode": "10001"
        },
        "lastName": "Doe",
        "firstName": "John"
      }
    }
  }
}
```

**Khalti Payment Order:**
```json
{
  "user_orders": {
    "2025-01-XX-TIMESTAMP": {
      "products": [
        {
          "size": "M",
          "color": "red",
          "discount": 10,
          "quantity": 2,
          "subtotal": 100,
          "unitPrice": 50,
          "documentId": "product-document-id",
          "finalPrice": 90
        }
      ],
      "shippingPrice": 5,
      "receiver_details": {
        "note": "Order notes",
        "email": "customer@example.com",
        "phone": "+1234567890",
        "address": {
          "city": "New York",
          "state": "NY",
          "street": "123 Main St",
          "country": "United States",
          "postalCode": "10001"
        },
        "lastName": "Doe",
        "firstName": "John"
      },
      "payment_info": {
        "provider": "khalti",
        "pidx": "khalti-payment-id",
        "transactionId": "khalti-transaction-id",
        "amount": 9000,
        "status": "Completed",
        "purchaseOrderId": "order-checkout-1234567890",
        "mobile": "+1234567890",
        "timestamp": "2025-01-XX-TIMESTAMP"
      }
    }
  }
}
```

### 3. Order Processing Flow

#### Cash Payment (COD) Flow:
1. **User Authentication**: Verify user is logged in
2. **Form Validation**: Check all required fields are filled
3. **Product Validation**: Ensure products are selected for checkout
4. **User Bag Lookup**: Find user's bag using Clerk user ID
5. **Order Data Preparation**: Calculate product details and format receiver information
6. **Database Update**: Save order to user_orders field
7. **User Feedback**: Show success/error messages
8. **Form Reset**: Clear form after successful submission

#### Khalti Payment Flow:
1. **User Authentication**: Verify user is logged in
2. **Form Validation**: Check all required fields are filled
3. **Product Validation**: Ensure products are selected for checkout
4. **Payment Initiation**: 
   - Save order data to user_orders (without payment_info)
   - Save payment initiation data to payments array
   - Redirect to Khalti payment gateway
5. **Payment Completion** (via callback):
   - Verify payment status with Khalti
   - Update payment data in payments array
   - Find and update the corresponding order with payment_info
   - Redirect user based on payment status

### 4. Key Functions

#### Cash Payment Functions:
- `handleCashPaymentOrder()` - Main COD order processing function
- `saveCashPaymentOrder(userBagDocumentId, orderData)` - Saves COD orders to database

#### Khalti Payment Functions:
- `handlePayment()` - Initiates Khalti payment with form validation
- `useKhalti()` - Hook that handles payment initiation and order saving
- `saveKhaltiPaymentOrder()` - Saves Khalti orders with payment information
- Khalti callback processing - Updates orders with final payment status

### 5. Error Handling

- **Authentication Errors**: User not logged in
- **Validation Errors**: Missing required form fields
- **Database Errors**: User bag not found, update failures
- **Network Errors**: API call failures
- **Payment Errors**: Khalti payment initiation/completion failures

### 6. User Experience

#### Cash Payment:
- **Real-time Validation**: Form validation on submission
- **Loading States**: Button shows "Processing Order..." during submission
- **Success Feedback**: Alert message on successful order placement
- **Form Reset**: Automatic form clearing after successful order

#### Khalti Payment:
- **Form Validation**: Required fields checked before payment initiation
- **Payment Processing**: Loading state during Khalti payment setup
- **Payment Gateway**: Redirect to Khalti for secure payment
- **Payment Callback**: Automatic processing and status update
- **Status-based Redirect**: Different redirects based on payment success/failure

## Usage

### Cash Payment:
1. User navigates to checkout page (`/checkout`)
2. User fills out the information form with required details
3. User selects "Cash on delivery" payment option
4. User clicks "Place Order (Cash on Delivery)" button
5. System validates and processes the order
6. User receives confirmation message
7. Order is saved to database for admin processing

### Khalti Payment:
1. User navigates to checkout page (`/checkout`)
2. User fills out the information form with required details
3. User selects "Pay with Khalti" payment option
4. User clicks "Pay with Khalti" button
5. System validates form and saves initial order data
6. User is redirected to Khalti payment gateway
7. User completes payment on Khalti
8. System receives callback and updates order with payment status
9. User is redirected based on payment result

## Database Schema

Order data is stored in the `user_bags` collection under the `user_orders` JSON field. Each order is keyed by its local timezone timestamp and contains:

- **products**: Array of ordered items with pricing details
- **shippingPrice**: Shipping cost (default: 5)
- **receiver_details**: Customer information and delivery address
- **payment_info** (Khalti only): Payment provider details and transaction information

Payment tracking data is also stored in the `payments` array within the user bag payload for Khalti transactions.

## Future Enhancements

- Order status tracking
- Email notifications
- Order history page
- Admin order management interface
- Inventory management integration
- Payment status updates
- Refund processing for Khalti payments
- Multiple payment method support
- Order cancellation functionality 