import { sendInvoiceEmail } from '../../utils/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerEmail, customerName, orderId, amount, pdfBase64, fileName } = req.body;

    if (!customerEmail || !pdfBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert base64 back to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    const result = await sendInvoiceEmail(
      customerEmail,
      customerName || 'Valued Customer',
      orderId || 'N/A',
      pdfBuffer,
      { amount, fileName }
    );

    if (result.success) {
      res.status(200).json({ success: true, message: 'Invoice email sent successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('API Error sending invoice email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}