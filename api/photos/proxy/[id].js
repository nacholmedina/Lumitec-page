import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Photo ID required' });
  }

  try {
    // Find the photo key by listing with prefix
    const { Contents = [] } = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: `photos/${id}.` })
    );

    const obj = Contents.find(o => /\.(jpg|png|webp)$/.test(o.Key));
    if (!obj) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const { Body, ContentType } = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: obj.Key })
    );

    const chunks = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    res.setHeader('Content-Type', ContentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(buffer);
  } catch (err) {
    console.error('Error proxying photo:', err);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
}
