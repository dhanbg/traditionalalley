import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateUserBagWithPayment, fetchDataFromApi } from "@/utils/api";

// Mock NPS payment handler for development when sandbox is unstable
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { amount, merchantTxnId, transactionRemarks, customer_info, userBagDocumentId, orderData } = body;

    console.log('=== MOCK NPS PAYMENT (Development Only) ===');
    console.log('User:', session.user.email);
    console.log('Amount:', amount);
    console.log('Transaction ID:', merchantTxnId);
    console.log('Order Data:', orderData ? 'Present' : 'Missing');
    console.log('User Bag ID:', userBagDocumentId);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful response
    const mockProcessId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get user bag ID (same logic as real NPS endpoint)
    let userBagId = userBagDocumentId;
    
    if (!userBagId) {
      try {
        const userDataResponse = await fetchDataFromApi(
          `/api/user-data?filters[authUserId][$eq]=${session.user.id}&populate=user_bag`
        );
        
        if (userDataResponse?.data && userDataResponse.data.length > 0) {
          const userData = userDataResponse.data[0];
          userBagId = userData.user_bag?.documentId;
          console.log('📦 Found user bag ID from user data:', userBagId);
        } else {
          console.log('⚠️ No user bag found for user:', session.user.id);
        }
      } catch (error) {
        console.error('❌ Error fetching user data:', error);
      }
    }

    // Save payment data to user bag (same as real NPS endpoint)
    if (userBagId) {
      try {
        const paymentData = {
          provider: "nps",
          processId: mockProcessId,
          merchantTxnId: merchantTxnId,
          amount: amount,
          status: "Pending",
          timestamp: new Date().toISOString(),
          authUserId: session.user.id,
          orderData: orderData, // Preserve orderData in mock payments
        };

        await updateUserBagWithPayment(userBagId, paymentData);
        console.log('✅ Mock payment data saved to user bag with orderData');
        console.log('📦 OrderData preserved:', orderData ? 'Yes' : 'No');
      } catch (error) {
        console.error('❌ Error saving mock payment data to user bag:', error);
        console.error('Error details:', error);
      }
    } else {
      console.error('❌ No user bag ID available - payment data not saved!');
    }
    
    // Get host for callback URL
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    const redirectForm = {
      MerchantId: '7536',
      MerchantName: 'Alley',
      Amount: parseFloat(amount.toString()).toFixed(2),
      MerchantTxnId: merchantTxnId,
      TransactionRemarks: transactionRemarks || `Mock payment for ${merchantTxnId}`,
      ProcessId: mockProcessId
    };

    console.log('✅ Mock payment initiated successfully');
    console.log('Mock Process ID:', mockProcessId);

    return NextResponse.json({
      success: true,
      message: 'Mock payment initiation successful (Development Mode)',
      data: {
        redirectForm: redirectForm,
        redirectUrl: `${protocol}://${host}/nps-callback?mock=true&status=success&processId=${mockProcessId}&merchantTxnId=${merchantTxnId}&Amount=${parseFloat(amount.toString()).toFixed(2)}`,
        isMock: true
      }
    });

  } catch (error: any) {
    console.error('❌ Error in mock NPS payment:', error);

    return NextResponse.json({
      success: false,
      message: 'Mock payment failed',
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
