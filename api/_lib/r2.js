import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

export async function listPhotos() {
  const { Contents = [] } = await s3.send(
    new ListObjectsV2Command({ Bucket: BUCKET, Prefix: 'photos/' })
  );

  return Contents
    .filter(obj => obj.Key !== 'photos/')
    .map(obj => ({
      id: obj.Key.replace('photos/', '').replace(/\.[^.]+$/, ''),
      url: `${PUBLIC_URL}/${obj.Key}`,
      key: obj.Key,
      uploadedAt: obj.LastModified?.toISOString(),
    }))
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

export async function uploadPhoto(id, buffer, contentType) {
  const ext = contentType === 'image/png' ? 'png'
    : contentType === 'image/webp' ? 'webp'
    : 'jpg';
  const key = `photos/${id}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return { id, url: `${PUBLIC_URL}/${key}`, key };
}

export async function deletePhoto(id) {
  // Try deleting all possible extensions (avoids expensive list operation)
  const extensions = ['jpg', 'png', 'webp'];
  await Promise.all(
    extensions.map(ext =>
      s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: `photos/${id}.${ext}` }))
        .catch(() => {})
    )
  );
}
