import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { verifyToken, getBearerToken } from '../_lib/auth.js';
import { setCors, handleOptions } from '../_lib/cors.js';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  const token = getBearerToken(req);
  if (!token) { res.status(401).json({ error: 'Belum login.' }); return; }
  try { await verifyToken(token); } catch { res.status(401).json({ error: 'Token tidak valid.' }); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  const { action, bucket, key, contentType } = req.body || {};
  if (!bucket || !key || !action) { res.status(400).json({ error: 'bucket, key, action wajib diisi.' }); return; }
  try {
    if (action === 'upload') {
      const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType || 'application/octet-stream' });
      const url = await getSignedUrl(s3, cmd, { expiresIn: 300 });
      res.status(200).json({ url, key }); return;
    }
    if (action === 'download') {
      const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
      const url = await getSignedUrl(s3, cmd, { expiresIn: 300 });
      res.status(200).json({ url, key }); return;
    }
    res.status(400).json({ error: 'action harus upload/download.' });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
