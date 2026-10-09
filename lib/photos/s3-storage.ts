// Photo files in S3 (infra/: private, KMS-encrypted bucket). Same interface
// as the local folder; files are still served only through the media route.

import { DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { checkKey, type PhotoStorage } from "./storage";

const contentType = (key: string) => (key.endsWith(".webp") ? "image/webp" : key.endsWith(".jpg") ? "image/jpeg" : "application/octet-stream");

export function s3PhotoStorage(bucket: string, client: Pick<S3Client, "send"> = new S3Client({})): PhotoStorage {
  return {
    async put(key, data) {
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: checkKey(key), Body: data, ContentType: contentType(key) }));
    },
    async get(key) {
      try {
        const out = await client.send(new GetObjectCommand({ Bucket: bucket, Key: checkKey(key) }));
        return out.Body ? Buffer.from(await out.Body.transformToByteArray()) : null;
      } catch (error) {
        if ((error as { name?: string }).name === "NoSuchKey") return null;
        throw error;
      }
    },
    async deletePrefix(prefix) {
      checkKey(prefix);
      const listed = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }));
      const keys = (listed.Contents ?? []).map((o) => o.Key).filter((k): k is string => Boolean(k));
      if (keys.length) await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: keys.map((Key) => ({ Key })) } }));
    },
  };
}
