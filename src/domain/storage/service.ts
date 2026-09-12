import { db } from "@/domain/client";

// ---------------------------------------------------------------------------
// storage domain — one place that knows the bucket names and their privacy.
// ---------------------------------------------------------------------------

export const BUCKETS = {
  vendorDocuments: "vendor-documents",
  ibanDocuments: "iban-documents",
  vendorPortfolios: "vendor-portfolios",
  platformPackageMedia: "platform-package-media",
  incidentAttachments: "incident-attachments",
  visionRefs: "vision-refs",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

export const upload = (bucket: BucketName, path: string, file: File, upsert = true) =>
  db.storage.from(bucket).upload(path, file, { upsert });

export const publicUrl = (bucket: BucketName, path: string) =>
  db.storage.from(bucket).getPublicUrl(path).data.publicUrl;

export const signedUrl = (bucket: BucketName, path: string, expiresIn = 3600) =>
  db.storage.from(bucket).createSignedUrl(path, expiresIn);

export const remove = (bucket: BucketName, paths: string[]) =>
  db.storage.from(bucket).remove(paths);
