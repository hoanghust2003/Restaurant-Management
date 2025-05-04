import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileUploadController } from './file-upload.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1h') 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}