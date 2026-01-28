import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PaymentError() {
  const router = useRouter();
  const [errorReason, setErrorReason] = useState<string>('');

  useEffect(() => {
    if (router.query.reason) {
      setErrorReason(router.query.reason as string);
    }
  }, [router.query]);

  const getErrorMessage = (reason: string) => {
    switch (reason) {
      case 'missing-parameters':
        return 'Payment information is incomplete. Please try again.';
      case 'processing-error':
        return 'There was an error processing your payment. Please contact support.';
      default:
        return 'An unexpected error occurred during payment processing.';
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
          <p className="text-gray-600 mb-6">
            {getErrorMessage(errorReason)}
          </p>
        </div>

        <div className="space-y-4">
          <Link 
            href="/checkout" 
            className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Payment Again
          </Link>
          
          <Link 
            href="/" 
            className="inline-block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Return to Home
          </Link>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">Need help?</p>
            <Link 
              href="/contact" 
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 