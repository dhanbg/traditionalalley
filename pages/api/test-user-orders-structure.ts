import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Example user_orders JSON structure with payment instrument data
  const exampleUserOrders = {
    payments: [
      {
        // Basic payment info
        provider: "nps",
        processId: "CD7E0463_D63D_4122_B974_EDC4A2A38708",
        merchantTxnId: "TXN-1735739234567-ORD123",
        gatewayReferenceNo: "100000035434",
        amount: 150.00,
        status: "Success",
        timestamp: "2025-01-02T10:30:00+05:45",
        
        // Payment instrument data (NEW - this is what you requested)
        institution: "Test Bank",           // Bank/Institution name
        instrument: "Test MBanking",        // Payment method used
        serviceCharge: "5.00",              // Service charge (fee NPS charges YOU as merchant)
        cbsMessage: "",                     // Bank response message
        
        // Processing flags
        webhook_processed: true,
        
        // Order details
        orderData: {
          products: [
            {
              documentId: "abc123",
              size: "M",
              color: "Red",
              quantity: 2,
              unitPrice: 50.00,
              subtotal: 100.00,
              discount: 0,
              finalPrice: 100.00,
              // DHL package fields
              weight: 1.5,
              length: 15,
              width: 10,
              height: 8,
              description: "Traditional Red Shirt",
              declaredValue: 50.00,
              commodityCode: "6109100000",
              manufacturingCountryCode: "NP"
            },
            {
              documentId: "def456",
              size: "L",
              color: "Blue", 
              quantity: 1,
              unitPrice: 40.00,
              subtotal: 40.00,
              discount: 0,
              finalPrice: 40.00,
              // DHL package fields
              weight: 1.2,
              length: 20,
              width: 12,
              height: 5,
              description: "Traditional Blue Scarf",
              declaredValue: 40.00,
              commodityCode: "6214100000",
              manufacturingCountryCode: "NP"
            }
          ],
          shippingPrice: 10.00,
          receiver_details: {
            fullName: "John Doe",        // Not firstName/lastName
            companyName: "",             // Company field
            email: "john@example.com",
            phone: "9841234567",
            countryCode: "+977",         // Phone country code
            address: {
              addressLine1: "123 Main St",  // Not street
              cityName: "Kathmandu",       // Not city
              countryCode: "NP",           // Not country
              postalCode: "44600"
              // No state field
              // No note field
            }
          }
        }
      },
      {
        // Another payment example with different payment method
        provider: "nps",
        processId: "AB1C2345_6789_1234_ABCD_EFGH12345678",
        merchantTxnId: "TXN-1735739234568-ORD124",
        gatewayReferenceNo: "100000035435",
        amount: 75.00,
        status: "Success",
        timestamp: "2025-01-01T15:45:00+05:45",
        
        // Different payment instrument
        institution: "Card Checkout NIC Asia",  // Different bank
        instrument: "Card Checkout NIC Asia",   // Credit/Debit card
        serviceCharge: "3.00",                  // Lower fee for card payments
        cbsMessage: "",
        
        webhook_processed: true,
        
        orderData: {
          products: [
            {
              documentId: "ghi789",
              size: "S",
              color: "Green",
              quantity: 1,
              unitPrice: 65.00,
              subtotal: 65.00,
              discount: 0,
              finalPrice: 65.00,
              // DHL package fields
              weight: 0.8,
              length: 12,
              width: 8,
              height: 6,
              description: "Traditional Green Dress",
              declaredValue: 65.00,
              commodityCode: "6204100000",
              manufacturingCountryCode: "NP"
            }
          ],
          shippingPrice: 10.00,
          receiver_details: {
            fullName: "Jane Smith",
            companyName: "Smith Trading Co",
            email: "jane@example.com",
            phone: "9851234567",
            countryCode: "+977",
            address: {
              addressLine1: "456 Oak Ave",
              cityName: "Pokhara",
              countryCode: "NP",
              postalCode: "33700"
            }
          }
        }
      }
    ]
  };

  return res.status(200).json({
    success: true,
    message: "Example user_orders structure with payment instrument data",
    data: {
      user_orders: exampleUserOrders,
      explanation: {
        new_fields: [
          "institution - Name of the bank/financial institution (e.g., 'Test Bank', 'Card Checkout NIC Asia')",
          "instrument - Payment method used (e.g., 'Test MBanking', 'Card Checkout NIC Asia', 'Khalti')",
          "serviceCharge - Fee that NPS charges YOU as merchant (deducted from your settlement amount)",
          "cbsMessage - Bank response message (usually empty for successful transactions)"
        ],
        structure_changes: [
          "REMOVED orderStatus from orderData - now only use payment.status",
          "REMOVED paymentMethod from orderData - now only use payment.provider",
          "UPDATED receiver_details to match actual DHL form:",
          "  - fullName (not firstName/lastName)",
          "  - companyName (added)",
          "  - countryCode for phone (added)",
          "  - address.addressLine1 (not street)",
          "  - address.cityName (not city)",
          "  - address.countryCode (not country)",
          "  - REMOVED state and note fields",
          "ADDED DHL package fields to products:",
          "  - weight, length, width, height",
          "  - description, declaredValue",
          "  - commodityCode (HS code), manufacturingCountryCode",
          "This structure now exactly matches the DHL shipping form"
        ],
        usage: [
          "Payment method: use payment.provider ('nps' or 'cod')",
          "Payment status: use payment.status ('Success', 'Fail', 'Pending')",
          "Recipient info: use receiver_details.fullName (not firstName/lastName)",
          "Address: use receiver_details.address.addressLine1 and cityName",
          "Package details: products now include weight, dimensions, HS codes",
          "All data structure matches DHL Express API requirements",
          "COD orders are saved with provider='cod' and status='Pending'"
        ]
      }
    }
  });
} 