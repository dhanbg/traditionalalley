import axios from "axios";
import crypto from "crypto";

// NPS API Configuration
export const npsConfig = {
  // Use sandbox for local development, production for deployed app
  baseURL: process.env.NODE_ENV === 'production' 
    ? (process.env.NPS_BASE_URL || 'https://apigateway.nepalpayment.com')
    : (process.env.NPS_BASE_URL || 'https://apisandbox.nepalpayment.com'),
    
  gatewayURL: process.env.NODE_ENV === 'production'
    ? (process.env.NPS_GATEWAY_URL || 'https://gateway.nepalpayment.com/payment/index')
    : (process.env.NPS_GATEWAY_URL || 'https://gatewaysandbox.nepalpayment.com/Payment/Index'),
  
  // Use production credentials for production, test credentials for development
  merchantId: process.env.NODE_ENV === 'production'
    ? (process.env.NPS_MERCHANT_ID || '530')
    : (process.env.NPS_MERCHANT_ID || '7536'),
    
  merchantName: process.env.NODE_ENV === 'production'
    ? (process.env.NPS_MERCHANT_NAME || 'traditionalapiuser')
    : (process.env.NPS_MERCHANT_NAME || 'Alley'),
  
  // API credentials based on environment
  apiUsername: process.env.NODE_ENV === 'production'
    ? (process.env.NPS_API_USERNAME || 'traditionalapiuser')
    : (process.env.NPS_API_USERNAME || 'Alley'),
    
  apiPassword: process.env.NODE_ENV === 'production'
    ? (process.env.NPS_API_PASSWORD || 'D9v@eX#2LmZ!q')
    : (process.env.NPS_API_PASSWORD || 'Alley@111'),
  
  // Secret key based on environment (with automatic cleaning of backslashes or incorrect variable expansions)
  secretKey: (() => {
    const rawKey = process.env.NODE_ENV === 'production'
      ? (process.env.NPS_SECRET_KEY || 'T$5nLz#o1Xp@')
      : (process.env.NPS_SECRET_KEY || 'Key@123');
    
    if (rawKey === 'T#o1Xp@' || rawKey === 'T\\$5nLz#o1Xp@') {
      return 'T$5nLz#o1Xp@';
    }
    if (rawKey.startsWith('T\\$5nLz')) {
      return rawKey.replace('T\\$5nLz', 'T$5nLz');
    }
    return rawKey;
  })(),
  
  // Test bank credentials (for testing purposes only)
  testBank: {
    username: 'test',
    password: 'test',
    transactionPin: '1234'
  }
};

// Create Axios client with Basic Auth
export const npsClient = axios.create({
  baseURL: npsConfig.baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  auth: {
    username: npsConfig.apiUsername,
    password: npsConfig.apiPassword,
  },
});

// Add request interceptor for signature generation and logging
npsClient.interceptors.request.use(
  (config) => {
    console.log(`NPS API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add signature to request data if it's a POST request with data
    if (config.method === 'post' && config.data) {
      const signature = createAPISignature(config.data);
      config.data.Signature = signature;
      console.log('Generated signature:', signature);
    }
    
    console.log('Request Data:', config.data);
    return config;
  },
  (error) => {
    console.error('NPS API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
npsClient.interceptors.response.use(
  (response) => {
    console.log(`NPS API Response: ${response.status} ${response.statusText}`);
    console.log('Response Data:', response.data);
    return response;
  },
  (error) => {
    console.error('NPS API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Utility function to generate HMAC-SHA512 signature
export const generateNPSSignature = (data: string): string => {
  return crypto
    .createHmac('sha512', npsConfig.secretKey)
    .update(data)
    .digest('hex')
    .toLowerCase(); // NPS expects lowercase hex
};

// Helper function to create signature for gateway redirect
export const createGatewaySignature = (
  merchantId: string,
  merchantName: string,
  amount: string,
  merchantTxnId: string,
  processId: string,
  transactionRemarks?: string,
  instrumentCode?: string
): string => {
  // Create concatenated string in alphabetical order of field names
  const params: Record<string, string> = {
    Amount: amount,
    MerchantId: merchantId,
    MerchantName: merchantName,
    MerchantTxnId: merchantTxnId,
    ProcessId: processId
  };
  
  if (transactionRemarks) {
    params.TransactionRemarks = transactionRemarks;
  }
  
  if (instrumentCode) {
    params.InstrumentCode = instrumentCode;
  }
  
  // Sort keys alphabetically and concatenate values
  const sortedKeys = Object.keys(params).sort();
  const concatenatedValues = sortedKeys.map(key => params[key]).join('');
  
  console.log('Gateway signature string:', concatenatedValues);
  return generateNPSSignature(concatenatedValues);
};

// Helper function to create signature for API requests
export const createAPISignature = (params: Record<string, any>): string => {
  // Remove existing signature if present
  const { Signature, ...cleanParams } = params;
  
  // Sort parameters alphabetically and concatenate values
  const sortedKeys = Object.keys(cleanParams).sort();
  const concatenatedValues = sortedKeys.map(key => cleanParams[key]).join('');
  
  console.log('API signature string:', concatenatedValues);
  const signature = generateNPSSignature(concatenatedValues);
  console.log('Generated signature:', signature);
  return signature;
};

// Native fetch wrapper that mimics Axios signature/auth integration
export async function npsFetch<T>(path: string, data: any): Promise<{ data: T }> {
  const url = `${npsConfig.baseURL}${path}`;
  
  // Make a shallow copy of payload to prevent modifying the original caller's data
  const requestData = { ...data };
  
  // Automatically generate signature if not provided, empty, or placeholder
  if (!requestData.Signature || requestData.Signature === 'placeholder' || requestData.Signature === '') {
    requestData.Signature = createAPISignature(requestData);
  }
  
  const authHeader = 'Basic ' + Buffer.from(`${npsConfig.apiUsername}:${npsConfig.apiPassword}`).toString('base64');
  
  console.log(`NPS Fetch Request: POST ${url}`);
  console.log('Request Data:', JSON.stringify(requestData, null, 2));
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authHeader
    },
    body: JSON.stringify(requestData)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { Message: errorText };
    }
    
    // Mimic Axios error structure so existing try/catch blocks don't break
    const errorObj = new Error(errorData.Message || `HTTP error! status: ${response.status}`) as any;
    errorObj.response = {
      status: response.status,
      data: errorData
    };
    throw errorObj;
  }
  
  const responseData = await response.json();
  console.log(`NPS Fetch Response: ${response.status}`);
  console.log('Response Data:', JSON.stringify(responseData, null, 2));
  
  return { data: responseData as T };
}