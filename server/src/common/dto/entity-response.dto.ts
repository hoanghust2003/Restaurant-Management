import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'User name',
    example: 'Nguyễn Văn A'
  })
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'User role',
    enum: ['admin', 'staff', 'kitchen', 'waiter', 'warehouse'],
    example: 'staff'
  })
  role: string;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatars/user.jpg',
    required: false
  })
  avatar_url?: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00Z'
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-01-01T00:00:00Z'
  })
  updated_at: Date;
}

export class IngredientResponseDto {
  @ApiProperty({
    description: 'Ingredient ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Ingredient name',
    example: 'Thịt bò'
  })
  name: string;

  @ApiProperty({
    description: 'Unit of measurement',
    example: 'kg'
  })
  unit: string;

  @ApiProperty({
    description: 'Low stock warning threshold',
    example: 10
  })
  threshold: number;

  @ApiProperty({
    description: 'Current available quantity',
    example: 25.5
  })
  current_quantity: number;

  @ApiProperty({
    description: 'Image URL',
    example: 'https://example.com/images/beef.jpg',
    required: false
  })
  image_url?: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00Z'
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-01-01T00:00:00Z'
  })
  updated_at: Date;
}

export class DishResponseDto {
  @ApiProperty({
    description: 'Dish ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Dish name',
    example: 'Phở Bò Tái'
  })
  name: string;

  @ApiProperty({
    description: 'Dish description',
    example: 'Phở bò tái truyền thống với nước dùng đậm đà'
  })
  description: string;

  @ApiProperty({
    description: 'Dish price in VND',
    example: 85000
  })
  price: number;

  @ApiProperty({
    description: 'Image URL',
    example: 'https://example.com/images/pho-bo-tai.jpg',
    required: false
  })
  image_url?: string;

  @ApiProperty({
    description: 'Whether the dish can be prepared',
    example: true
  })
  is_preparable: boolean;

  @ApiProperty({
    description: 'Whether the dish is available',
    example: true
  })
  available: boolean;

  @ApiProperty({
    description: 'Preparation time in minutes',
    example: 15
  })
  preparation_time: number;

  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  categoryId: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00Z'
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-01-01T00:00:00Z'
  })
  updated_at: Date;
}
