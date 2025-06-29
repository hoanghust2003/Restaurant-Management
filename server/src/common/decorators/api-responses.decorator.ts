import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { 
  ErrorResponseDto, 
  ValidationErrorResponseDto,
  UnauthorizedResponseDto,
  ForbiddenResponseDto,
  NotFoundResponseDto 
} from '../dto/api-response.dto';

export function ApiCommonResponses() {
  return applyDecorators(
    ApiResponse({ 
      status: 400, 
      description: 'Bad Request - Validation failed', 
      type: ValidationErrorResponseDto 
    }),
    ApiResponse({ 
      status: 500, 
      description: 'Internal Server Error', 
      type: ErrorResponseDto 
    }),
  );
}

export function ApiAuthResponses() {
  return applyDecorators(
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - Token required or invalid', 
      type: UnauthorizedResponseDto 
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - Insufficient permissions', 
      type: ForbiddenResponseDto 
    }),
  );
}

export function ApiCrudResponses() {
  return applyDecorators(
    ApiCommonResponses(),
    ApiAuthResponses(),
    ApiResponse({ 
      status: 404, 
      description: 'Not Found - Resource not found', 
      type: NotFoundResponseDto 
    }),
  );
}

export function ApiCreateResponses() {
  return applyDecorators(
    ApiCommonResponses(),
    ApiAuthResponses(),
  );
}

export function ApiGetResponses() {
  return applyDecorators(
    ApiCommonResponses(),
    ApiResponse({ 
      status: 404, 
      description: 'Not Found - Resource not found', 
      type: NotFoundResponseDto 
    }),
  );
}

export function ApiUpdateResponses() {
  return applyDecorators(
    ApiCrudResponses(),
  );
}

export function ApiDeleteResponses() {
  return applyDecorators(
    ApiCrudResponses(),
  );
}
