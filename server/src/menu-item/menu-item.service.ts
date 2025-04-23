import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem, MenuItemCategory } from './entities/menu-item.entity';
import { MenuItemIngredient } from './entities/menu-item-ingredient.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItemIngredientDto, CreateMenuItemIngredientsDto } from './dto/menu-item-ingredient.dto';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Dish } from './entities/dish.entity';
import { Category } from './entities/category.entity';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(MenuItemIngredient)
    private menuItemIngredientRepository: Repository<MenuItemIngredient>,
    @InjectRepository(InventoryItem)
    private inventoryItemRepository: Repository<InventoryItem>,
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const menuItem = this.menuItemRepository.create(createMenuItemDto);

    // Nếu menu item đã được tạo lưu vào bảng MenuItem, đồng thời tạo Dish tương ứng
    const savedMenuItem = await this.menuItemRepository.save(menuItem);

    try {
      // Tìm Category phù hợp
      const categoryName = createMenuItemDto.category.toLowerCase();
      let category = await this.categoryRepository.findOne({ 
        where: { name: categoryName } 
      });

      // Nếu không tìm thấy category phù hợp, sử dụng category mặc định đầu tiên
      if (!category) {
        const categories = await this.categoryRepository.find({ take: 1 });
        if (categories.length > 0) {
          category = categories[0];
        } else {
          // Tạo category mặc định nếu không có category nào
          category = await this.categoryRepository.save({
            name: categoryName,
            description: `Auto-generated category for ${categoryName}`
          });
        }
      }

      // Tạo Dish mới sử dụng thông tin từ MenuItem
      await this.dishRepository.save({
        name: savedMenuItem.name,
        description: savedMenuItem.description,
        price: savedMenuItem.price,
        categoryId: category.id,
        preparation_time: savedMenuItem.preparationTimeMinutes,
        is_available: savedMenuItem.isAvailable
      });
    } catch (error) {
      console.error('Error creating corresponding dish:', error);
    }
    
    return savedMenuItem;
  }

  async findAll(): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      order: {
        category: 'ASC',
        name: 'ASC',
      },
    });
  }

  // Lấy danh sách các Dish để dần chuyển đổi sang cấu trúc mới
  async findAllDishes(): Promise<Dish[]> {
    try {
      return this.dishRepository.find({
        relations: ['category'],
        order: {
          category: { 
            name: 'ASC' 
          },
          name: 'ASC',
        },
      });
    } catch (error) {
      // Trả về mảng rỗng nếu chưa có bảng dishes
      console.error('Error fetching dishes:', error);
      return [];
    }
  }

  async findByCategory(category: MenuItemCategory): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      where: { category },
      order: { name: 'ASC' },
    });
  }

  async findAvailable(): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      where: { isAvailable: true },
      order: {
        category: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['ingredients', 'ingredients.ingredient'],
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return menuItem;
  }

  // Tìm dish bằng UUID
  async findOneDish(id: string): Promise<Dish> {
    const dish = await this.dishRepository.findOne({
      where: { id },
      relations: ['category', 'dishIngredients', 'dishIngredients.ingredient'],
    });

    if (!dish) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }

    return dish;
  }

  async update(id: number, updateMenuItemDto: UpdateMenuItemDto): Promise<MenuItem> {
    const menuItem = await this.findOne(id);
    
    // Cập nhật các thuộc tính của món ăn
    Object.assign(menuItem, updateMenuItemDto);
    
    return this.menuItemRepository.save(menuItem);
  }

  async updateAvailability(id: number, isAvailable: boolean): Promise<MenuItem> {
    const menuItem = await this.findOne(id);
    menuItem.isAvailable = isAvailable;
    return this.menuItemRepository.save(menuItem);
  }

  async remove(id: number): Promise<void> {
    const menuItem = await this.findOne(id);
    await this.menuItemRepository.remove(menuItem);
  }

  // Các phương thức quản lý nguyên liệu cho món ăn
  async addIngredients(dto: CreateMenuItemIngredientsDto): Promise<MenuItem> {
    const { menuItemId, ingredients } = dto;
    const menuItem = await this.findOne(menuItemId);
    
    for (const ingredientDto of ingredients) {
      const ingredient = await this.inventoryItemRepository.findOne({
        where: { id: ingredientDto.ingredientId }
      });
      
      if (!ingredient) {
        throw new NotFoundException(`Ingredient with ID ${ingredientDto.ingredientId} not found`);
      }
      
      const menuItemIngredient = this.menuItemIngredientRepository.create({
        menuItemId: menuItem.id,
        ingredientId: ingredient.id,
        quantity: ingredientDto.quantity,
        unit: ingredientDto.unit,
      });
      
      await this.menuItemIngredientRepository.save(menuItemIngredient);
    }
    
    return this.findOne(menuItemId);
  }

  async getMenuItemIngredients(menuItemId: number): Promise<MenuItemIngredient[]> {
    const menuItem = await this.findOne(menuItemId);
    
    return this.menuItemIngredientRepository.find({
      where: { menuItemId: menuItem.id },
      relations: ['ingredient'],
    });
  }

  async removeIngredient(menuItemId: number, ingredientId: number): Promise<void> {
    const menuItemIngredient = await this.menuItemIngredientRepository.findOne({
      where: { 
        menuItemId,
        ingredientId,
      }
    });
    
    if (!menuItemIngredient) {
      throw new NotFoundException(
        `Ingredient with ID ${ingredientId} not found for menu item with ID ${menuItemId}`
      );
    }
    
    await this.menuItemIngredientRepository.remove(menuItemIngredient);
  }

  async updateIngredient(
    menuItemId: number, 
    ingredientId: number, 
    data: MenuItemIngredientDto
  ): Promise<MenuItemIngredient> {
    const menuItemIngredient = await this.menuItemIngredientRepository.findOne({
      where: { 
        menuItemId,
        ingredientId,
      }
    });
    
    if (!menuItemIngredient) {
      throw new NotFoundException(
        `Ingredient with ID ${ingredientId} not found for menu item with ID ${menuItemId}`
      );
    }
    
    menuItemIngredient.quantity = data.quantity;
    menuItemIngredient.unit = data.unit;
    
    return this.menuItemIngredientRepository.save(menuItemIngredient);
  }
}