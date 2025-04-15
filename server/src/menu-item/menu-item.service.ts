import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem, MenuItemCategory } from './entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  async create(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const menuItem = this.menuItemRepository.create(createMenuItemDto);
    return this.menuItemRepository.save(menuItem);
  }

  async findAll(): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      order: {
        category: 'ASC',
        name: 'ASC',
      },
    });
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
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return menuItem;
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
}