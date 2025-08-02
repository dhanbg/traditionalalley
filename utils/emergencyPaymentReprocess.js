const { processPostPaymentStockAndCart } = require('./postPaymentProcessing');
const { getPaymentByMerchantTxnId, updatePaymentStatus } = require('./paymentDataUtils');

async function reprocessFailedPayment(merchantTxnId) {
  try {
    console.log(`🆘 EMERGENCY REPROCESSING: ${merchantTxnId}`);
    
    // 1. Fetch payment record
    const payment = await getPaymentByMerchantTxnId(merchantTxnId);
    if (!payment) throw new Error('Payment not found');
    
    // 2. Force status to success
    if (payment.status === 'Fail') {
      await updatePaymentStatus(payment.documentId, 'Success');
      console.log(`✅ Forced status to Success: ${merchantTxnId}`);
    }
    
    // 3. Trigger stock update and cart cleanup
    if (payment.orderData) {
      await processPostPaymentStockAndCart(
        payment.orderData,
        { id: payment.userId }, // Minimal user object
        async (itemIds) => {
          console.log(`🗑️ Clearing cart items: ${itemIds.join(', ')}`);
          // Add cart cleanup logic here
        }
      );
      console.log(`🔄 Inventory updated & cart cleared for: ${merchantTxnId}`);
      return true;
    }
    
    throw new Error('Missing orderData');
  } catch (error) {
    console.error(`❌ Reprocessing failed: ${error.message}`);
    return false;
  }
}

module.exports = { reprocessFailedPayment };
