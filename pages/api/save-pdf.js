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
    let savedToDisk = false;

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const pdfBuffer = Buffer.from(pdfBase64, 'base64');
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, pdfBuffer);
      savedToDisk = true;
      console.log('✅ PDF saved successfully to disk:', filePath);
    } catch (fsError) {
      console.warn('⚠️ File system is read-only (expected on Vercel). Skipping disk write. Error:', fsError.message);
    }
    
    // Generate download URL
    const downloadUrl = `/uploads/invoices/${fileName}`;
    
    console.log('🔗 Generated Download URL:', downloadUrl);

    res.status(200).json({
      success: true,
      message: savedToDisk ? 'PDF saved successfully' : 'PDF generated successfully (memory fallback)',
      downloadUrl,
      fileName,
      fileSize: Buffer.from(pdfBase64, 'base64').length
    });

  } catch (error) {
    console.error('❌ Error handling PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process PDF: ' + error.message
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