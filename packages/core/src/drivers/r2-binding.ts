import type { R2BucketReader, StorageDriver, StorageObject } from "../types/index.js";

export class R2BindingDriver implements StorageDriver {
  private bucket: R2BucketReader;

  constructor(bucket: R2BucketReader) {
    this.bucket = bucket;
  }

  async get(key: string): Promise<StorageObject | null> {
    return this.bucket.get(key);
  }

  async head(key: string): Promise<StorageObject | null> {
    return this.bucket.head(key);
  }
}
