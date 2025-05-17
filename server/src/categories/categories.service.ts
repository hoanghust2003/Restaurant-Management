import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  async findAll(includeDeleted: boolean = false): Promise<Category[]> {
    try {
      this.logger.log(`Fetching all categories, includeDeleted=${includeDeleted}`);
      if (includeDeleted) {
        return this.categoryRepository.find({
          withDeleted: true
        });
      }
      return this.categoryRepository.find();
    } catch (error) {
      this.logger.error(`Error fetching categories: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string, includeDeleted: boolean = false): Promise<Category> {
    try {
      this.logger.log(`Finding category by id: ${id}, includeDeleted=${includeDeleted}`);
      const category = await this.categoryRepository.findOne({
        where: { id },
        withDeleted: includeDeleted
      });
      
      if (!category) {
        this.logger.warn(`Category with ID ${id} not found`);
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      
      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding category ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }  async create(createCategoryDto: CreateCategoryDto, userRole: UserRole): Promise<Category> {
    try {
      // Validate admin, manager or warehouse role for category creation
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to create a category`);
        throw new ForbiddenException('Only admin, manager or warehouse managers can create categories');
      }
      
      this.logger.log(`Creating new category: ${createCategoryDto.name}`);
      const category = this.categoryRepository.create(createCategoryDto);
      
      return await this.categoryRepository.save(category);
    } catch (error) {
      this.logger.error(`Error creating category: ${error.message}`, error.stack);
      throw error;
    }
  }  async update(id: string, updateCategoryDto: UpdateCategoryDto, userRole: UserRole): Promise<Category> {
    try {
      // Validate admin, manager or warehouse role for category updates
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to update category ${id}`);
        throw new ForbiddenException('Only admin, manager or warehouse managers can update category information');
      }
      
      this.logger.log(`Updating category ${id}`);
      const category = await this.findOne(id);
      
      this.categoryRepository.merge(category, updateCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error updating category ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }  async remove(id: string, userRole: UserRole): Promise<boolean> {
    try {
      // Validate admin, manager or warehouse role for category deletion
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to delete category ${id}`);
        throw new ForbiddenException('Only admin, manager or warehouse managers can delete categories');
      }
        this.logger.log(`Soft-deleting category ${id}`);
      // Verify category exists before deletion
      await this.findOne(id);
      
      // Using soft delete instead of hard delete
      const result = await this.categoryRepository.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      
      return true;    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error removing category ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async restore(id: string, userRole: UserRole): Promise<Category> {
    try {
      // Validate admin, manager or warehouse role for category restoration
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to restore category ${id}`);
        throw new ForbiddenException('Only admin, manager or warehouse managers can restore categories');
      }
        this.logger.log(`Restoring soft-deleted category ${id}`);
      // Verify category exists (including deleted ones)
      const category = await this.findOne(id, true);
      
      if (!category.deleted_at) {
        this.logger.warn(`Category ${id} is not deleted, cannot restore`);
        throw new ForbiddenException(`Category with ID ${id} is not deleted`);
      }
      
      // Restore the soft-deleted category
      await this.categoryRepository.restore(id);
      
      // Return the restored category
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error restoring category ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
