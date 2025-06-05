import { useState } from 'react';
import axios from 'axios';

const TestPaymentStatus = () => {
  const [pidx, setPidx] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateResult, setUpdateResult] = useState('');

  const checkStatus = async () => {
    if (!pidx.trim()) {
      setError('Please enter a pidx');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('/api/khalti-lookup', { pidx: pidx.trim() });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const manuallyUpdatePayment = async () => {
    if (!result || !result.pidx) {
      setError('Please check payment status first');
      return;
    }

    setUpdateLoading(true);
    setUpdateResult('');

    try {
      // Simulate the callback by calling the same logic
      const response = await axios.post('/api/manual-payment-update', {
        pidx: result.pidx,
        paymentData: result
      });
      
      setUpdateResult('Payment status updated successfully in your account!');
    } catch (err: any) {
      setUpdateResult(`Error updating payment: ${err.response?.data?.error || err.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Test Khalti Payment Status</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          Enter pidx:
          <br />
          <input
            type="text"
            value={pidx}
            onChange={(e) => setPidx(e.target.value)}
            placeholder="e.g., e79QXuRd8irzymqept6zj3"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </label>
      </div>

      <button 
        onClick={checkStatus} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginRight: '10px'
        }}
      >
        {loading ? 'Checking...' : 'Check Status'}
      </button>

      {result && result.status === 'Completed' && (
        <button 
          onClick={manuallyUpdatePayment} 
          disabled={updateLoading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: updateLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {updateLoading ? 'Updating...' : 'Manually Update Payment in Account'}
        </button>
      )}

      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {updateResult && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: updateResult.includes('Error') ? '#f8d7da' : '#d4edda', 
          color: updateResult.includes('Error') ? '#721c24' : '#155724', 
          border: `1px solid ${updateResult.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`,
          borderRadius: '4px'
        }}>
          {updateResult}
        </div>
      )}

      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: result.status === 'Completed' ? '#d4edda' : '#fff3cd', 
          color: result.status === 'Completed' ? '#155724' : '#856404', 
          border: `1px solid ${result.status === 'Completed' ? '#c3e6cb' : '#ffeaa7'}`,
          borderRadius: '4px'
        }}>
          <h3>Payment Status Result:</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Status:</strong> <span style={{ 
              color: result.status === 'Completed' ? 'green' : result.status === 'Failed' ? 'red' : 'orange',
              fontWeight: 'bold'
            }}>{result.status}</span>
          </div>
          {result.status === 'Completed' && (
            <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#d1ecf1', borderRadius: '4px' }}>
              <strong>✅ Payment Successful!</strong><br/>
              Transaction ID: <code>{result.transaction_id}</code><br/>
              Amount: NPR {(result.total_amount / 100).toFixed(2)}
            </div>
          )}
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Copy the pidx from your payment JSON (e.g., "e79QXuRd8irzymqept6zj3")</li>
          <li>Paste it in the input field above</li>
          <li>Click "Check Status" to see the current payment status from Khalti</li>
          <li><strong>If status is "Completed" but not showing in your account:</strong> Click "Manually Update Payment in Account"</li>
        </ol>
        
        <h4>Expected Status Values:</h4>
        <ul>
          <li><strong>Initiated:</strong> Payment was started but not completed</li>
          <li><strong>Completed:</strong> Payment was successful ✅</li>
          <li><strong>Failed:</strong> Payment failed ❌</li>
          <li><strong>Pending:</strong> Payment is being processed ⏳</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPaymentStatus; 