import { sendInvoiceEmail } from '../../utils/email';

export default async function handler(req, res) {
  console.log('🔥 API /send-invoice-email called');
  console.log('📋 Request method:', req.method);
  
  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📦 Request body keys:', Object.keys(req.body || {}));
    const { customerEmail, customerName, orderId, amount, pdfBase64, fileName, downloadUrl } = req.body;
    
    console.log('📧 Email details:', {
      customerEmail,
      customerName,
      orderId,
      amount,
      fileName,
      pdfSize: pdfBase64 ? pdfBase64.length : 0,
      downloadUrl
    });

    if (!customerEmail) {
      console.log('❌ Missing customer email');
      return res.status(400).json({ error: 'Customer email is required' });
    }

    if (!pdfBase64 && !downloadUrl) {
      console.log('❌ Missing PDF data - need either pdfBase64 or downloadUrl');
      return res.status(400).json({ error: 'Either pdfBase64 or downloadUrl is required' });
    }

    let pdfBuffer = null;
    
    if (pdfBase64) {
      console.log('🔄 Converting PDF base64 to buffer...');
      pdfBuffer = Buffer.from(pdfBase64, 'base64');
      console.log('✅ PDF buffer created, size:', pdfBuffer.length, 'bytes');
    } else {
      console.log('🔗 Using download URL instead of attachment:', downloadUrl);
    }

    console.log('📤 Calling sendInvoiceEmail function...');
    const result = await sendInvoiceEmail(
      customerEmail,
      customerName || 'Valued Customer',
      orderId || 'N/A',
      pdfBuffer,
      { amount, fileName, downloadUrl }
    );
    
    console.log('📧 Email sending result:', result);

    if (result.success) {
      console.log('✅ Email sent successfully, returning success response');
      res.status(200).json({ success: true, message: 'Invoice email sent successfully' });
    } else {
      console.log('❌ Email sending failed:', result.error);
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('💥 API Error sending invoice email:', error);
    console.error('💥 Error stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
}