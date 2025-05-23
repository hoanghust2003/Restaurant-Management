import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOptionsOrder } from 'typeorm';
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
      
      // Always order by is_main DESC (main menu first), then created_at ASC
      const menus = await this.menuRepository.find({
        withDeleted: includeDeleted,
        order: {
          is_main: 'DESC',
          created_at: 'ASC'
        } as FindOptionsOrder<Menu>
      });
      
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
      }, {} as Record<string, any[]>);
      
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

  async findOne(id: string, includeDeleted: boolean = false): Promise<Menu> {
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
        dishes: menuDishes.map(md => md.dish).filter(dish => dish !== null)
      };
      
      return menuWithDishes as Menu;
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

      // Nếu tạo menu mới với is_main=true thì unset tất cả menu khác
      if (createMenuDto.is_main) {
        await this.menuRepository.update({ is_main: true }, { is_main: false });
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
      // Validate admin or chef role for menu update
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.CHEF) {
        this.logger.warn(`User with role ${userRole} attempted to update menu ${id}`);
        throw new ForbiddenException('Only admin or chef can update menus');
      }

      const menu = await this.menuRepository.findOne({ where: { id } });
      if (!menu) {
        throw new NotFoundException(`Menu with ID ${id} not found`);
      }

      // If setting this menu as main, do it through setMainMenu for transaction safety
      if (updateMenuDto.is_main) {
        delete updateMenuDto.is_main;
        Object.assign(menu, updateMenuDto);
        const updatedMenu = await this.menuRepository.save(menu);
        return await this.setMainMenu(id);
      }

      // Update menu
      Object.assign(menu, updateMenuDto);
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

  async addDishes(menuId: string, dishIds: string[]): Promise<Menu> {
    try {
      const menu = await this.menuRepository.findOne({ 
        where: { id: menuId },
        relations: ['dishes'] 
      });

      if (!menu) {
        throw new NotFoundException(`Menu with ID ${menuId} not found`);
      }

      // Create menu-dish relationships
      const menuDishes = dishIds.map(dishId => {
        const menuDish = new MenuDish();
        menuDish.menuId = menuId;
        menuDish.dishId = dishId;
        return menuDish;
      });

      await this.menuDishRepository.save(menuDishes);
      return await this.findOne(menuId);
    } catch (error) {
      this.logger.error(`Error adding dishes to menu: ${error.message}`);
      throw new Error('Failed to add dishes to menu');
    }
  }

  async removeDishes(menuId: string, dishIds: string[]): Promise<Menu> {
    try {
      await this.menuDishRepository.delete({
        menuId,
        dishId: In(dishIds)
      });

      return await this.findOne(menuId);
    } catch (error) {
      this.logger.error(`Error removing dishes from menu: ${error.message}`);
      throw new Error('Failed to remove dishes from menu');
    }
  }

  async getMainMenu(): Promise<Menu> {
    try {
      const mainMenu = await this.menuRepository.findOne({
        where: { is_main: true },
        relations: ['menuItems', 'menuItems.product', 'dishes'],
      });

      if (!mainMenu) {
        throw new NotFoundException('No main menu found');
      }

      return mainMenu;
    } catch (error) {
      this.logger.error(`Error getting main menu: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set a menu as the main menu. This will unset any existing main menu first.
   * @param id The ID of the menu to set as main
   * @returns The updated menu
   */
  async setMainMenu(id: string): Promise<Menu> {
    const queryRunner = this.menuRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the menu first to verify it exists
      const menu = await queryRunner.manager.findOne(Menu, { 
        where: { id } 
      });
      
      if (!menu) {
        throw new NotFoundException(`Menu with ID ${id} not found`);
      }

      // Unset any existing main menu
      await queryRunner.manager.update(Menu, 
        { is_main: true }, 
        { is_main: false }
      );

      // Set this menu as main
      if (!menu.is_main) {
        menu.is_main = true;
        await queryRunner.manager.save(menu);
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Return with menu data including dishes
      this.logger.log(`Menu ${id} set as main menu`);
      const updatedMenu = await this.findOne(id);

      // Clear cache by querying all menus with new order
      await this.findAll(false);
      
      return updatedMenu;
    } catch (error) {
      this.logger.error(`Error setting main menu: ${error.message}`);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
