import * as Minio from 'minio';
import { Readable } from 'stream';
import { config } from '../config';

export class MinioService {
  private client: Minio.Client;
  public readonly bucketName: string;

  constructor() {
    this.bucketName = config.pkg.minio.bucket;

    const endPoint = config.pkg.minio.endPoint.replace(/^https?:\/\//, '');

    this.client = new Minio.Client({
      endPoint: endPoint,
      port: config.pkg.minio.port,
      useSSL: config.app.env == 'production', // Set 'true' if production using SSL/HTTPS
      accessKey: config.pkg.minio.accessKey,
      secretKey: config.pkg.minio.secretKey,
    });
  }

  /**
   * Validation bucket on server minio
   */
  public async initBucket(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName, 'us-east-1');
        console.log(
          `[MinIO] Bucket '${this.bucketName}' created successfully.`
        );
      } else {
        console.log(`[MinIO] Bucket '${this.bucketName}' is ready.`);
      }
    } catch (error) {
      console.error('[MinIO] Bucket initialization failed:', error);
    }
  }

  /**
   * Upload Buffer or ReadableStream to MinIO Storage
   */
  public async uploadFile(
    objectName: string,
    streamOrBuffer: Buffer | Readable,
    size?: number,
    metaData: Minio.ItemBucketMetadata = {}
  ): Promise<string> {
    try {
      if (Buffer.isBuffer(streamOrBuffer)) {
        await this.client.putObject(
          this.bucketName,
          objectName,
          streamOrBuffer,
          streamOrBuffer.length,
          metaData
        );
      } else {
        await this.client.putObject(
          this.bucketName,
          objectName,
          streamOrBuffer,
          size,
          metaData
        );
      }
      return objectName;
    } catch (error) {
      console.error(`[MinIO] Failed to upload object '${objectName}':`, error);
      throw error;
    }
  }

  /**
   * Create temporary presigned url for download/preview file private
   */
  public async getPresignedUrl(
    objectName: string,
    expiryInSeconds = 3600
  ): Promise<string> {
    try {
      return await this.client.presignedGetObject(
        this.bucketName,
        objectName,
        expiryInSeconds
      );
    } catch (error) {
      console.error(
        `[MinIO] Failed to generate presigned URL for '${objectName}':`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete file from MinIO Storage
   */
  public async deleteFile(objectName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucketName, objectName);
      console.log(`[MinIO] File '${objectName}' removed successfully.`);
    } catch (error) {
      console.error(`[MinIO] Failed to delete file '${objectName}':`, error);
      throw error;
    }
  }

  public getClient(): Minio.Client {
    return this.client;
  }
}

export const minioService = new MinioService();
