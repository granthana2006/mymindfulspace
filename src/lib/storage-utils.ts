import { supabase } from "@/integrations/supabase/client";

/**
 * Extract the object path within a bucket from either a stored path
 * (e.g. "userId/123.jpg") or a full Supabase Storage URL
 * (public: /storage/v1/object/public/<bucket>/<path>,
 *  signed: /storage/v1/object/sign/<bucket>/<path>?token=...).
 */
export function extractStoragePath(bucket: string, value: string): string | null {
  if (!value) return null;
  const marker = `/${bucket}/`;
  const idx = value.indexOf(marker);
  if (idx === -1) {
    // assume it's already a path
    return value.split("?")[0];
  }
  return value.slice(idx + marker.length).split("?")[0];
}

const SIGNED_URL_TTL = 60 * 60; // 1 hour

export async function signStorageUrl(bucket: string, value: string): Promise<string> {
  if (!value) return "";
  const path = extractStoragePath(bucket, value);
  if (!path) return "";
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) return "";
  return data.signedUrl;
}

export async function signMany<T extends Record<string, any>>(
  items: T[],
  bucket: string,
  field: keyof T,
): Promise<T[]> {
  return Promise.all(
    items.map(async (item) => {
      const val = item[field] as unknown as string;
      if (!val) return item;
      const signed = await signStorageUrl(bucket, val);
      return { ...item, [field]: signed };
    }),
  );
}
