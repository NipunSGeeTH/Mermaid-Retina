import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

const SHARE_HASH_KEY = "view";
const LAUNCH_HASH_KEY = "code";

export type SharedHashParseResult = {
  hasShareCode: boolean;
  code: string | null;
};

export function buildShareHash(code: string): string {
  const compressed = compressToEncodedURIComponent(code);
  if (!compressed) {
    return "";
  }
  const params = new URLSearchParams();
  params.set(SHARE_HASH_KEY, compressed);
  return params.toString();
}

export function parseSharedCodeFromHash(hash: string): SharedHashParseResult {
  const normalized = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!normalized) {
    return { hasShareCode: false, code: null };
  }

  const params = new URLSearchParams(normalized);
  const compressed = params.get(SHARE_HASH_KEY);
  if (compressed) {
    const decompressed = decompressFromEncodedURIComponent(compressed);
    if (typeof decompressed !== "string") {
      return { hasShareCode: true, code: null };
    }

    return { hasShareCode: true, code: decompressed };
  }

  const launchedCode = params.get(LAUNCH_HASH_KEY);
  if (launchedCode === null) {
    return { hasShareCode: false, code: null };
  }

  if (!launchedCode.trim()) {
    return { hasShareCode: true, code: null };
  }

  return { hasShareCode: true, code: launchedCode };
}
