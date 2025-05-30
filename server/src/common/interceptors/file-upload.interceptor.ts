import { CallHandler, ExecutionContext, Injectable, NestInterceptor, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        if (error?.message?.includes('file extension')) {
          throw new BadRequestException('Ảnh đại diện phải có định dạng PNG, JPEG hoặc JPG');
        }
        if (error?.message?.includes('maxSize')) {
          throw new BadRequestException('Ảnh đại diện không được vượt quá 5MB');
        }
        throw error;
      }),
    );
  }
}
