import { useState } from 'react';

const WebhookTest = () => {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testWebhook = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      // Sample webhook payload (you can modify this for testing)
      const webhookPayload = {
        pidx: 'test-pidx-' + Date.now(),
        total_amount: 1000, // 10 NPR in paisa
        status: 'Completed',
        transaction_id: 'test-txn-' + Date.now(),
        fee: 30,
        refunded: false,
        purchase_order_id: 'order-test-' + Date.now() + '-user_2example', // Replace with actual user ID
        purchase_order_name: 'Test Webhook Payment'
      };

      console.log('Testing webhook with payload:', webhookPayload);

      const response = await fetch('/api/khalti-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      const result = await response.json();
      
      if (response.ok) {
        setTestResult(`✅ Webhook test successful!\n\nResponse: ${JSON.stringify(result, null, 2)}`);
      } else {
        setTestResult(`❌ Webhook test failed!\n\nError: ${JSON.stringify(result, null, 2)}`);
      }
    } catch (error) {
      console.error('Webhook test error:', error);
      setTestResult(`❌ Webhook test error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔧 Khalti Webhook Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Make sure your development server is running</li>
          <li>Update the <code>purchase_order_id</code> in the test payload with a real user ID</li>
          <li>Click "Test Webhook" to simulate a Khalti webhook call</li>
          <li>Check if the payment data gets saved to the user's bag</li>
        </ol>
      </div>

      <button 
        onClick={testWebhook}
        disabled={isLoading}
        style={{
          padding: '12px 24px',
          backgroundColor: '#5C2D91',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '16px'
        }}
      >
        {isLoading ? 'Testing...' : 'Test Webhook'}
      </button>

      {testResult && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: testResult.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px'
        }}>
          <h4>Test Result:</h4>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{testResult}</pre>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
        <h4>⚠️ Important Notes:</h4>
        <ul>
          <li><strong>Production Setup:</strong> In production, you'll need to configure Khalti to send webhooks to your domain (e.g., <code>https://yourdomain.com/api/khalti-webhook</code>)</li>
          <li><strong>Security:</strong> In production, verify webhook signatures from Khalti</li>
          <li><strong>User ID:</strong> Make sure the purchase_order_id format includes the correct user ID</li>
        </ul>
      </div>
    </div>
  );
};

export default WebhookTest; 