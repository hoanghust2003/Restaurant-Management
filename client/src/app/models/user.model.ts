/**
 * Model representing a user in the system
 */
export interface UserModel {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  phoneNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Data transfer object for creating a user
 */
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string;
  phoneNumber?: string;
  avatar?: string;
}

/**
 * Data transfer object for updating a user
 */
export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  phoneNumber?: string;
  avatar?: string;
}

/**
 * Data transfer object for updating user password
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
