import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as multerS3 from 'multer-s3';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  private s3Client: S3Client;
  private bucket: string;
  private readonly logger = new Logger(FileUploadService.name);
  private readonly useS3: boolean;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION') || 'eu-north-1';
    const accessKey = this.configService.get<string>('S3_ACCESS_KEY') || '';
    const secretKey = this.configService.get<string>('S3_SECRET_KEY') || '';
    this.bucket = this.configService.get<string>('AWS_BUCKET_NAME') || 'default-bucket';
    
    // Check if S3 credentials are provided AND if S3 should be used
    // Adding FORCE_LOCAL_STORAGE check - set to 'true' in .env to disable S3
    const forceLocalStorage = this.configService.get<string>('FORCE_LOCAL_STORAGE');
    this.useS3 = !!(accessKey && secretKey && this.bucket && forceLocalStorage !== 'true');
    
    if (this.useS3) {
      // Initialize S3 client
      this.s3Client = new S3Client({
        region: region,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      });
      this.logger.log('S3 client initialized with bucket: ' + this.bucket);
    } else {
      this.logger.log('Using local file storage for uploads');
    }
    
    // Ensure local upload directories exist
    this.ensureDirectoryExists(path.join(process.cwd(), 'uploads'));
    this.ensureDirectoryExists(path.join(process.cwd(), 'uploads', 'avatars'));
    this.ensureDirectoryExists(path.join(process.cwd(), 'uploads', 'dishes'));
  }

  /**
   * Create directory if it doesn't exist
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      this.logger.log(`Created directory: ${dirPath}`);
    }
  }

  /**
   * Get S3 upload options for multer middleware
   * @param folder Folder path in the bucket (e.g., 'avatars', 'dishes')
   * @returns multerS3 options object
   */
  getS3UploadOptions(folder: string = '') {
    if (!this.useS3) {
      throw new BadRequestException('S3 is not configured');
    }
    
    return multerS3({
      s3: this.s3Client,
      bucket: this.bucket,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const fileExtension = file.originalname.split('.').pop();
        const key = folder 
          ? `${folder}/${uuid()}.${fileExtension}`
          : `${uuid()}.${fileExtension}`;
        cb(null, key);
      },
    });
  }

  /**
   * Upload a file directly to S3 or locally as fallback
   * @param file The file to upload
   * @param folder The folder to upload to (e.g., 'avatars', 'dishes')
   * @returns Promise that resolves to the URL of the uploaded file
   */
  async uploadFile(file: Express.Multer.File, folder: string = ''): Promise<string | null> {
    if (!file) {
      return null;
    }

    // Prefer local storage since we're having S3 permission issues
    try {
      // Skip S3 attempts and go straight to local storage
      return this.uploadToLocal(file, folder);
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Upload file to S3
   */
  private async uploadToS3(file: Express.Multer.File, folder: string): Promise<string> {
    // Generate a unique file name
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const fileName = `${uuid()}.${fileExtension}`;
    
    // Set the key (path) for the file in S3
    const key = folder ? `${folder}/${fileName}` : fileName;

    // Create the S3 upload command
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    try {
      // Upload the file to S3
      await this.s3Client.send(command);
      
      // Return the URL of the uploaded file
      const fileUrl = `https://${this.bucket}.s3.${this.configService.get<string>('AWS_REGION') || 'eu-north-1'}.amazonaws.com/${key}`;
      this.logger.log(`File uploaded to S3: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      this.logger.error(`S3 upload error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Upload file to local storage
   */
  private uploadToLocal(file: Express.Multer.File, folder: string): string {
    try {
      // Generate a unique file name
      const fileExtension = file.originalname.split('.').pop() || 'jpg';
      const fileName = `${uuid()}.${fileExtension}`;
      
      // Set the path for local storage
      const uploadFolder = folder 
        ? path.join(process.cwd(), 'uploads', folder) 
        : path.join(process.cwd(), 'uploads');
      
      // Ensure directory exists
      this.ensureDirectoryExists(uploadFolder);
      
      const filePath = path.join(uploadFolder, fileName);
      
      // Write the file
      fs.writeFileSync(filePath, file.buffer);
      
      // Return URL (relative path)
      const url = `/uploads/${folder ? folder + '/' : ''}${fileName}`;
      this.logger.log(`File uploaded locally: ${url}`);
      return url;
    } catch (error) {
      this.logger.error(`Local upload error: ${error.message}`, error.stack);
      throw new BadRequestException(`Local file upload failed: ${error.message}`);
    }
  }

  /**
   * Generate a signed URL for a file in S3
   * @param key The key (path) of the file in S3
   * @param expiresIn Expiration time in seconds
   * @returns Signed URL for accessing the file
   */
  async generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.useS3) {
      throw new BadRequestException('S3 is not configured');
    }
    
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Error generating signed URL: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Delete a file from S3
   * @param key The key (path) of the file in S3
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.useS3) {
      // If S3 not configured, try to delete local file
      return this.deleteLocalFile(key);
    }
    
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting file from S3: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Delete a file from local storage
   */
  private deleteLocalFile(filePath: string): void {
    try {
      // If the path starts with /uploads, it's from local storage
      if (filePath.startsWith('/uploads')) {
        const localPath = path.join(process.cwd(), filePath);
        
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
          this.logger.log(`File deleted locally: ${filePath}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error deleting local file: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to delete local file: ${error.message}`);
    }
  }

  /**
   * Extract the file key from a full S3 URL
   * @param fileUrl Full S3 URL
   * @returns File key (path in S3)
   */
  extractKeyFromUrl(fileUrl: string): string | null {
    // Handle local file URLs
    if (fileUrl && fileUrl.startsWith('/uploads')) {
      return fileUrl;
    }
    
    // Handle S3 URLs
    const bucketName = this.bucket;
    // Check if URL contains the bucket name
    if (!fileUrl || !fileUrl.includes(bucketName)) {
      return null;
    }

    // Extract the key part after the bucket name
    const startIndex = fileUrl.indexOf(bucketName) + bucketName.length + 1;
    return fileUrl.substring(startIndex);
  }
}