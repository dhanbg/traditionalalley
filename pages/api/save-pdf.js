import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, pdfBase64 } = req.body;

    if (!fileName || !pdfBase64) {
      return res.status(400).json({ error: 'Missing fileName or pdfBase64' });
    }

    console.log('💾 Saving PDF file:', fileName);
    console.log('📦 PDF size:', Math.round(pdfBase64.length / 1024), 'KB');

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'invoices');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Convert base64 to buffer and save file
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const filePath = path.join(uploadsDir, fileName);
    
    fs.writeFileSync(filePath, pdfBuffer);
    
    // Generate download URL
    const downloadUrl = `/uploads/invoices/${fileName}`;
    
    console.log('✅ PDF saved successfully to:', filePath);
    console.log('🔗 Download URL:', downloadUrl);

    res.status(200).json({
      success: true,
      message: 'PDF saved successfully',
      downloadUrl,
      fileName,
      fileSize: pdfBuffer.length
    });

  } catch (error) {
    console.error('❌ Error saving PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save PDF: ' + error.message
    });
  }
}

// Increase the body size limit for large PDFs
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb', // Allow up to 15MB for base64 PDFs
    },
  },
};
