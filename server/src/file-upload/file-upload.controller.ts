import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FileUploadService } from './file-upload.service';
import { extname } from 'path';

@Controller('uploads')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `avatar-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return { url: file.path };
  }

  @Post('s3/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: undefined, // Use S3 storage instead of disk storage
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  async uploadAvatarToS3(@UploadedFile() file: Express.Multer.File) {
    // Use the new uploadFile method instead of the old approach
    const avatarUrl = await this.fileUploadService.uploadFile(file, 'avatars');
    return { url: avatarUrl };
  }

  @Post('s3/:folder')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: undefined, // Use S3 storage instead of disk storage
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit for other images
    },
  }))
  async uploadToS3(@UploadedFile() file: Express.Multer.File, @Param('folder') folder: string) {
    // Validate folder to prevent security issues
    const allowedFolders = ['avatars', 'dishes', 'menus', 'ingredients', 'categories'];
    if (!allowedFolders.includes(folder)) {
      throw new Error('Invalid folder specified');
    }
    
    // Use the new uploadFile method instead of the old approach
    const imageUrl = await this.fileUploadService.uploadFile(file, folder);
    return { url: imageUrl };
  }
}