import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('NPS test endpoint hit');
  console.log('Query params:', req.query);
  console.log('Headers:', req.headers);
  
  // Set content type to plain text and send response
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('received');
  return;
} 