// Common API Response DTOs
export * from './dto/api-response.dto';
export * from './dto/entity-response.dto';

// Common API Response Decorators
export * from './decorators/api-responses.decorator';

// Re-export commonly used Swagger decorators
export {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiProperty,
  ApiBearerAuth,
  ApiConsumes,
  ApiProduces,
  ApiHeaders,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
