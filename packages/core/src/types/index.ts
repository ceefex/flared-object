export interface R2ObjectMetadata {
  readonly size: number;
  readonly httpEtag: string;
  readonly uploaded: Date;
  readonly body?: ReadableStream<Uint8Array>;
  writeHttpMetadata(headers: Headers): void;
}

export interface R2BucketReader {
  get(key: string): Promise<R2ObjectMetadata | null>;
  head(key: string): Promise<R2ObjectMetadata | null>;
}

export interface StorageObject {
  readonly size: number;
  readonly httpEtag: string;
  readonly uploaded: Date;
  readonly body?: ReadableStream<Uint8Array>;
  writeHttpMetadata(headers: Headers): void;
}

export interface StorageDriver {
  get(key: string): Promise<StorageObject | null>;
  head(key: string): Promise<StorageObject | null>;
}

export type SecurityMode = "none" | "signed-url" | "referer" | "signed-url+referer";

export interface SecurityConfig {
  mode: SecurityMode;
  hmacSecret?: string;
  allowedReferers?: string[];
}

export interface ErrorDetail {
  code: string;
  title: string;
  description: string;
}
