import { authenticate } from '../_lib/auth.js';
import { deletePhoto } from '../_lib/r2.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await authenticate(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Photo ID required' });
  }

  try {
    await deletePhoto(id);
    res.status(200).json({ success: true });
  } catch (err) {
    if (err.message === 'Photo not found') {
      return res.status(404).json({ error: 'Photo not found' });
    }
    console.error('Error deleting photo:', err);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
}
