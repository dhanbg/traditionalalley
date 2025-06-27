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
              finalPrice: 100.00
            },
            {
              documentId: "def456",
              size: "L",
              color: "Blue", 
              quantity: 1,
              unitPrice: 40.00,
              subtotal: 40.00,
              discount: 0,
              finalPrice: 40.00
            }
          ],
          shippingPrice: 10.00,
          receiver_details: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            phone: "9841234567",
            address: {
              street: "123 Main St",
              city: "Kathmandu",
              state: "Bagmati",
              country: "Nepal",
              postalCode: "44600"
            },
            note: "Please deliver after 5 PM"
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
              finalPrice: 65.00
            }
          ],
          shippingPrice: 10.00,
          receiver_details: {
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
            phone: "9851234567",
            address: {
              street: "456 Oak Ave",
              city: "Pokhara",
              state: "Gandaki",
              country: "Nepal",
              postalCode: "33700"
            },
            note: ""
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
        usage: [
          "You can now see which payment method each customer used for their orders",
          "The 'instrument' field shows the specific payment method (Mobile Banking, Card, etc.)",
          "The 'institution' field shows which bank or service provider was used",
          "This data is automatically captured from NPS API when payments are processed"
        ]
      }
    }
  });
} 