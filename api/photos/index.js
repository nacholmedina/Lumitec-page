import { listPhotos } from '../_lib/r2.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const photos = await listPhotos();
    res.status(200).json({ photos });
  } catch (err) {
    console.error('Error listing photos:', err);
    res.status(500).json({ error: 'Failed to list photos' });
  }
}
