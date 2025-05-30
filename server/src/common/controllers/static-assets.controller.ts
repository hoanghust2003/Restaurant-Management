import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('assets')
export class StaticAssetsController {
  private readonly uploadsDir: string;

  constructor() {
    // Configure the uploads directory path
    this.uploadsDir = path.join(process.cwd(), 'uploads');
  }

  @Get('avatars/:filename')
  async getAvatar(@Param('filename') filename: string, @Res() res: Response) {
    return this.serveFile(res, 'avatars', filename);
  }

  @Get('dishes/:filename')
  async getDishImage(@Param('filename') filename: string, @Res() res: Response) {
    return this.serveFile(res, 'dishes', filename);
  }

  @Get('menus/:filename')
  async getMenuImage(@Param('filename') filename: string, @Res() res: Response) {
    return this.serveFile(res, 'menus', filename);
  }
  
  @Get('ingredients/:filename')
  async getIngredientImage(@Param('filename') filename: string, @Res() res: Response) {
    return this.serveFile(res, 'ingredients', filename);
  }

  private async serveFile(res: Response, subdir: string, filename: string) {
    try {
      const filePath = path.join(this.uploadsDir, subdir, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('Image not found');
      }

      // Set appropriate content type based on extension
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.png') {
        contentType = 'image/png';
      } else if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.gif') {
        contentType = 'image/gif';
      } else if (ext === '.webp') {
        contentType = 'image/webp';
      }

      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'max-age=2592000', // 30 days cache
        'Cross-Origin-Resource-Policy': 'cross-origin',
      });

      // Stream the file to the response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Error serving image');
    }
  }
}
