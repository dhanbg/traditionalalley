import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { npsClient, npsConfig, createAPISignature, createGatewaySignature } from '@/utils/npsConfig';
import { updateUserBagWithPayment, fetchDataFromApi } from '@/utils/api';

interface NPSPaymentRequest {
  amount: number;
  merchantTxnId: string;
  transactionRemarks?: string;
  instrumentCode?: string;
  customer_info?: {
    name: string;
    email: string;
    phone: string;
  };
  userBagDocumentId?: string;
  orderData?: any;
}

interface GetProcessIdRequest {
  MerchantId: string;
  MerchantName: string;
  Amount: string;
  MerchantTxnId: string;
  Signature: string;
}

interface GetProcessIdResponse {
  code: string;
  message: string;
  data: {
    ProcessId: string;
  };
}

interface GatewayRedirectForm {
  MerchantId: string;
  MerchantName: string;
  Amount: string;
  MerchantTxnId: string;
  TransactionRemarks: string;
  InstrumentCode?: string;
  ProcessId: string;
}

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

    const body: NPSPaymentRequest = await request.json();
    const { 
      amount, 
      merchantTxnId, 
      transactionRemarks,
      instrumentCode,
      customer_info,
      userBagDocumentId,
      orderData
    } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Valid amount is required'
      }, { status: 400 });
    }

    if (!merchantTxnId) {
      return NextResponse.json({
        success: false,
        message: 'Merchant transaction ID is required'
      }, { status: 400 });
    }

    console.log('=== NPS PAYMENT INITIATION ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('User:', session.user.email);
    console.log('Request body:', body);
    console.log('NPS Config:', {
      baseURL: npsConfig.baseURL,
      merchantId: npsConfig.merchantId,
      merchantName: npsConfig.merchantName,
      apiUsername: npsConfig.apiUsername
    });

    // Get user data from Strapi using Auth.js user ID
    let userBagId = userBagDocumentId;
    
    if (!userBagId) {
      try {
        const userDataResponse = await fetchDataFromApi(
          `/api/user-datas?filters[authUserId][$eq]=${session.user.id}&populate=user_bag`
        );
        
        if (userDataResponse?.data && userDataResponse.data.length > 0) {
          const userData = userDataResponse.data[0];
          userBagId = userData.user_bag?.documentId;
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    // Shorten the merchant transaction ID to avoid potential length issues
    const shortMerchantTxnId = merchantTxnId.length > 50 
      ? `TXN-${Date.now()}-${merchantTxnId.split('-').pop()}` 
      : merchantTxnId;

    console.log('Original merchantTxnId:', merchantTxnId);
    console.log('Shortened merchantTxnId:', shortMerchantTxnId);

    // Step 1: Get Process ID from NPS
    const processIdRequest: GetProcessIdRequest = {
      MerchantId: npsConfig.merchantId,
      MerchantName: npsConfig.merchantName,
      Amount: parseFloat(amount.toString()).toFixed(2),
      MerchantTxnId: shortMerchantTxnId,
      Signature: ""
    };

    const signature = createAPISignature(processIdRequest);
    processIdRequest.Signature = signature;

    console.log('Process ID request:', processIdRequest);

    const processIdResponse = await npsClient.post<GetProcessIdResponse>(
      '/GetProcessId',
      processIdRequest
    );

    console.log('Process ID response:', processIdResponse.data);

    if (processIdResponse.data.code !== "0") {
      console.error('❌ NPS API Error Details:', {
        code: processIdResponse.data.code,
        message: processIdResponse.data.message,
        fullResponse: processIdResponse.data
      });
      
      return NextResponse.json({
        success: false,
        message: processIdResponse.data.message || 'Failed to get process ID',
        error: `Code: ${processIdResponse.data.code}`,
        details: processIdResponse.data
      }, { status: 400 });
    }

    const processId = processIdResponse.data.data.ProcessId;
    console.log('Got Process ID:', processId);

    // Save payment data to user bag if available
    if (userBagId) {
      try {
        const paymentData = {
          provider: "nps",
          processId: processId,
          merchantTxnId: shortMerchantTxnId,
          amount: amount,
          status: "Pending",
          timestamp: new Date().toISOString(),
          authUserId: session.user.id,
          orderData: orderData,
        };

        await updateUserBagWithPayment(userBagId, paymentData);
        console.log('Payment data saved to user bag');
      } catch (error) {
        console.error('Error saving payment data to user bag:', error);
      }
    }

    // Step 2: Prepare gateway redirect form
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const responseUrl = `${protocol}://${host}/nps-callback`;

    const gatewayParams = {
      MerchantId: npsConfig.merchantId,
      MerchantName: npsConfig.merchantName,
      Amount: parseFloat(amount.toString()).toFixed(2),
      MerchantTxnId: shortMerchantTxnId,
      ProcessId: processId
    };

    const gatewaySignature = createGatewaySignature(
      gatewayParams.MerchantId,
      gatewayParams.MerchantName,
      gatewayParams.Amount,
      gatewayParams.MerchantTxnId,
      gatewayParams.ProcessId
    );

    const redirectForm: GatewayRedirectForm = {
      MerchantId: gatewayParams.MerchantId,
      MerchantName: gatewayParams.MerchantName,
      Amount: gatewayParams.Amount,
      MerchantTxnId: gatewayParams.MerchantTxnId,
      TransactionRemarks: transactionRemarks || `Payment for order ${shortMerchantTxnId}`,
      InstrumentCode: instrumentCode,
      ProcessId: processId
    };

    console.log('Gateway redirect form:', redirectForm);

    return NextResponse.json({
      success: true,
      message: 'Payment initiation successful',
      data: {
        redirectForm: redirectForm,
        redirectUrl: npsConfig.gatewayURL
      }
    });

  } catch (error: any) {
    console.error('❌ Error initiating NPS payment:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Internal server error';

    return NextResponse.json({
      success: false,
      message: 'Failed to initiate payment',
      error: errorMessage,
      details: error.response?.data || error.message
    }, { status: 500 });
  }
} 