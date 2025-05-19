import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { CreateMenuDto, UpdateMenuDto } from './dto';
import { UserRole } from '../enums/user-role.enum';
import { MenuDish } from '../entities/menu-dish.entity';

@Injectable()
export class MenusService {
  private readonly logger = new Logger(MenusService.name);

  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(MenuDish)
    private menuDishRepository: Repository<MenuDish>
  ) {}
  async findAll(includeDeleted: boolean = false): Promise<any[]> {
    try {
      this.logger.log(`Fetching all menus, includeDeleted=${includeDeleted}`);
      let menus;
      if (includeDeleted) {
        menus = await this.menuRepository.find({
          withDeleted: true
        });
      } else {
        menus = await this.menuRepository.find();
      }
      
      // Get all menu-dish relationships
      const allMenuDishes = await this.menuDishRepository.find({
        relations: ['dish'],
        withDeleted: includeDeleted
      });
      
      // Group dishes by menuId
      const dishesByMenuId = allMenuDishes.reduce((acc, md) => {
        if (!acc[md.menuId]) {
          acc[md.menuId] = [];
        }
        if (md.dish) {
          acc[md.menuId].push(md.dish);
        }
        return acc;
      }, {});
      
      // Add dishes to each menu
      const menusWithDishes = menus.map(menu => ({
        ...menu,
        dishes: dishesByMenuId[menu.id] || []
      }));
      
      return menusWithDishes;
    } catch (error) {
      this.logger.error(`Error fetching menus: ${error.message}`, error.stack);
      throw error;
    }
  }
  async findOne(id: string, includeDeleted: boolean = false): Promise<any> {
    try {
      this.logger.log(`Finding menu by id: ${id}, includeDeleted=${includeDeleted}`);
      const menu = await this.menuRepository.findOne({
        where: { id },
        withDeleted: includeDeleted
      });
      
      if (!menu) {
        this.logger.warn(`Menu with ID ${id} not found`);
        throw new NotFoundException(`Menu with ID ${id} not found`);
      }
      
      // Get the dishes for this menu
      const menuDishes = await this.menuDishRepository.find({
        where: { menuId: id },
        relations: ['dish'],
        withDeleted: includeDeleted
      });
      
      // Transform menu with dishes
      const menuWithDishes = {
        ...menu,
        dishes: menuDishes.map(md => md.dish)
      };
      
      return menuWithDishes;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding menu ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async create(createMenuDto: CreateMenuDto, userRole: UserRole): Promise<Menu> {
    try {
      // Validate admin or chef role for menu creation
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.CHEF) {
        this.logger.warn(`User with role ${userRole} attempted to create a menu`);
        throw new ForbiddenException('Only admin or chef can create menus');
      }
      
      this.logger.log(`Creating new menu: ${createMenuDto.name}`);
      const menu = this.menuRepository.create(createMenuDto);
      
      return await this.menuRepository.save(menu);
    } catch (error) {
      this.logger.error(`Error creating menu: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateMenuDto: UpdateMenuDto, userRole: UserRole): Promise<Menu> {
    try {
      // Validate admin or chef role for menu updates
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.CHEF) {
        this.logger.warn(`User with role ${userRole} attempted to update menu ${id}`);
        throw new ForbiddenException('Only admin or chef can update menu information');
      }
      
      this.logger.log(`Updating menu ${id}`);
      const menu = await this.findOne(id);
      
      this.menuRepository.merge(menu, updateMenuDto);
      return await this.menuRepository.save(menu);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error updating menu ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string, userRole: UserRole): Promise<boolean> {
    try {
      // Validate admin or chef role for menu deletion
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.CHEF) {
        this.logger.warn(`User with role ${userRole} attempted to delete menu ${id}`);
        throw new ForbiddenException('Only admin or chef can delete menus');
      }
      
      this.logger.log(`Soft-deleting menu ${id}`);
      
      // Verify menu exists before deletion
      await this.findOne(id);
      
      // Using soft delete instead of hard delete
      const result = await this.menuRepository.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Menu with ID ${id} not found`);
      }
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error removing menu ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async restore(id: string, userRole: UserRole): Promise<Menu> {
    try {
      // Validate admin or chef role for menu restoration
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.CHEF) {
        this.logger.warn(`User with role ${userRole} attempted to restore menu ${id}`);
        throw new ForbiddenException('Only admin or chef can restore menus');
      }
      
      this.logger.log(`Restoring soft-deleted menu ${id}`);
      
      // Verify menu exists (including deleted ones)
      const menu = await this.findOne(id, true);
      
      if (!menu.deleted_at) {
        this.logger.warn(`Menu ${id} is not deleted, cannot restore`);
        throw new ForbiddenException(`Menu with ID ${id} is not deleted`);
      }
      
      // Restore the soft-deleted menu
      await this.menuRepository.restore(id);
      
      // Return the restored menu
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error restoring menu ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getDishes(menuId: string): Promise<MenuDish[]> {
    try {
      return this.menuDishRepository.find({
        where: { menuId },
        relations: ['dish']
      });
    } catch (error) {
      this.logger.error(`Error getting dishes for menu ${menuId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async addDishToMenu(menuId: string, dishId: string, userRole: UserRole): Promise<MenuDish> {
    try {
      // Validate admin or chef role
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.CHEF) {
        this.logger.warn(`User with role ${userRole} attempted to add dish to menu`);
        throw new ForbiddenException('Only admin or chef can modify menu dishes');
      }
      
      // Check if the menu exists
      await this.findOne(menuId);
      
      // Check if the dish is already in the menu
      const existingMenuDish = await this.menuDishRepository.findOne({
        where: { menuId, dishId }
      });
      
      if (existingMenuDish) {
        if (existingMenuDish.deleted_at) {
          // If soft-deleted, restore it
          await this.menuDishRepository.restore(existingMenuDish.id);
          const restoredMenuDish = await this.menuDishRepository.findOne({
            where: { id: existingMenuDish.id },
            relations: ['dish']
          });
          
          if (!restoredMenuDish) {
            throw new NotFoundException(`Failed to find the restored menu dish with ID ${existingMenuDish.id}`);
          }
          
          return restoredMenuDish;
        }
        this.logger.warn(`Dish ${dishId} is already in menu ${menuId}`);
        throw new ForbiddenException(`Dish is already in the menu`);
      }
      
      // Create new menu-dish relationship
      const menuDish = this.menuDishRepository.create({
        menuId,
        dishId
      });
      
      return await this.menuDishRepository.save(menuDish);
    } catch (error) {
      this.logger.error(`Error adding dish ${dishId} to menu ${menuId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async removeDishFromMenu(menuId: string, dishId: string, userRole: UserRole): Promise<boolean> {
    try {
      // Validate admin or chef role
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.CHEF) {
        this.logger.warn(`User with role ${userRole} attempted to remove dish from menu`);
        throw new ForbiddenException('Only admin or chef can modify menu dishes');
      }
      
      // Find the menu-dish relationship
      const menuDish = await this.menuDishRepository.findOne({
        where: { menuId, dishId }
      });
      
      if (!menuDish) {
        this.logger.warn(`Dish ${dishId} is not in menu ${menuId}`);
        throw new NotFoundException(`Dish is not in the menu`);
      }
      
      // Soft delete the relationship
      await this.menuDishRepository.softDelete(menuDish.id);
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error removing dish ${dishId} from menu ${menuId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
