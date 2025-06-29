import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Operation completed successfully'
  })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'An error occurred'
  })
  message: string;

  @ApiProperty({
    description: 'Error details',
    example: 'Validation failed',
    required: false
  })
  error?: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400
  })
  statusCode: number;
}

export class ValidationErrorResponseDto {
  @ApiProperty({
    description: 'Validation error details',
    type: 'array',
    items: {
      type: 'string'
    },
    example: ['Name is required', 'Email must be valid']
  })
  message: string[];

  @ApiProperty({
    description: 'Error details',
    example: 'Validation failed',
    required: false
  })
  error?: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400
  })
  statusCode: number;
}

export class UnauthorizedResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Unauthorized'
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 401
  })
  statusCode: number;
}

export class ForbiddenResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Forbidden resource'
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 403
  })
  statusCode: number;
}

export class NotFoundResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Resource not found'
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 404
  })
  statusCode: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of data items'
  })
  data: T[];

  @ApiProperty({
    description: 'Total count of items',
    example: 100
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10
  })
  totalPages: number;
}
