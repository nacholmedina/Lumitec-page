import { authenticate } from '../_lib/auth.js';
import { uploadPhoto } from '../_lib/r2.js';
import { randomUUID } from 'crypto';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await authenticate(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { image, contentType } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const type = contentType || 'image/jpeg';
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid image type. Use JPEG, PNG, or WebP.' });
    }

    // Check base64 string length before decoding to prevent memory exhaustion
    const maxBase64Length = Math.ceil(5 * 1024 * 1024 * 1.34);
    if (image.length > maxBase64Length) {
      return res.status(400).json({ error: 'Image too large. Max 5MB.' });
    }

    const buffer = Buffer.from(image, 'base64');

    const id = randomUUID();
    const photo = await uploadPhoto(id, buffer, type);
    res.status(201).json({ photo });
  } catch (err) {
    console.error('Error uploading photo:', err);
    res.status(500).json({ error: 'Failed to upload photo', detail: err.message });
  }
}
