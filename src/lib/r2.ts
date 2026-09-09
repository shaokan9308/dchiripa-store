import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME!
const PUBLIC_URL = process.env.R2_PUBLIC_URL

export async function uploadFile(key: string, body: Buffer | ReadableStream | Blob, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body as any,
    ContentType: contentType,
  })
  await r2.send(command)
  return `${PUBLIC_URL}/${key}`
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${key.split('/').pop()}"`,
  })
  return getSignedUrl(r2, command, { expiresIn })
}

export async function getSignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(r2, command, { expiresIn })
}

export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })
  await r2.send(command)
}

export async function listFiles(prefix?: string) {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
  })
  const response = await r2.send(command)
  return response.Contents || []
}

export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`
}