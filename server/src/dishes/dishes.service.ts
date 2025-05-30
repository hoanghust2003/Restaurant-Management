import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Dish } from '../entities/dish.entity';
import { DishIngredient } from '../entities/dish-ingredient.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
    @InjectRepository(DishIngredient)
    private dishIngredientRepository: Repository<DishIngredient>,
    private dataSource: DataSource,
  ) {}

  /**
   * Tạo món ăn mới
   */
  async create(createDishDto: CreateDishDto): Promise<Dish> {
    const { ingredients, ...dishData } = createDishDto;
    
    // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Tạo món ăn
      const dishRepository = queryRunner.manager.getRepository(Dish);
      const dish = dishRepository.create(dishData);
      const savedDish = await dishRepository.save(dish);
      
      // Thêm nguyên liệu nếu có
      if (ingredients && ingredients.length > 0) {
        const dishIngredientRepository = queryRunner.manager.getRepository(DishIngredient);
        
        const dishIngredients = ingredients.map(ingredient => {
          return dishIngredientRepository.create({
            dishId: savedDish.id,
            ingredientId: ingredient.ingredientId,
            quantity: ingredient.quantity,
          });
        });
        
        await dishIngredientRepository.save(dishIngredients);
      }
      
      await queryRunner.commitTransaction();
      
      // Lấy món ăn đã lưu với đầy đủ thông tin
      return this.findOne(savedDish.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Lấy tất cả món ăn
   * @param includeDeleted nếu true, bao gồm cả món ăn đã xóa mềm
   */
  async findAll(includeDeleted = false): Promise<Dish[]> {
    return this.dishRepository.find({
      withDeleted: includeDeleted,
      relations: ['category', 'dishIngredients', 'dishIngredients.ingredient'],
    });
  }

  /**
   * Lấy thông tin một món ăn theo id
   * @param id ID của món ăn
   * @param includeDeleted nếu true, tìm cả trong những món ăn đã xóa mềm
   */
  async findOne(id: string, includeDeleted = false): Promise<Dish> {
    const dish = await this.dishRepository.findOne({
      where: { id },
      withDeleted: includeDeleted,
      relations: ['category', 'dishIngredients', 'dishIngredients.ingredient'],
    });
    
    if (!dish) {
      throw new NotFoundException(`Không tìm thấy món ăn với ID: ${id}`);
    }
    
    return dish;
  }

  /**
   * Cập nhật thông tin món ăn
   */
  async update(id: string, updateDishDto: UpdateDishDto): Promise<Dish> {
    const { ingredients, ...dishData } = updateDishDto;
    
    // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Cập nhật thông tin món ăn
      if (Object.keys(dishData).length > 0) {
        await queryRunner.manager.update(Dish, id, dishData);
      }
      
      // Cập nhật nguyên liệu nếu có
      if (ingredients) {
        // Xóa các nguyên liệu hiện tại
        await queryRunner.manager.delete(DishIngredient, { dishId: id });
        
        // Thêm nguyên liệu mới
        if (ingredients.length > 0) {
          const dishIngredientRepository = queryRunner.manager.getRepository(DishIngredient);
          
          const dishIngredients = ingredients.map(ingredient => {
            return dishIngredientRepository.create({
              dishId: id,
              ingredientId: ingredient.ingredientId,
              quantity: ingredient.quantity,
            });
          });
          
          await dishIngredientRepository.save(dishIngredients);
        }
      }
      
      await queryRunner.commitTransaction();
      
      // Lấy món ăn đã cập nhật với đầy đủ thông tin
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Xóa mềm món ăn
   */
  async remove(id: string): Promise<void> {
    const dish = await this.findOne(id);
    await this.dishRepository.softDelete(id);
    // Cũng xóa mềm các nguyên liệu của món ăn
    await this.dishIngredientRepository.softDelete({ dishId: id });
  }

  /**
   * Khôi phục món ăn đã xóa mềm
   */
  async restore(id: string): Promise<Dish> {
    await this.dishRepository.restore(id);
    // Khôi phục các nguyên liệu của món ăn
    await this.dishIngredientRepository.restore({ dishId: id });
    return this.findOne(id);
  }

  /**
   * Xóa vĩnh viễn món ăn
   */
  async hardDelete(id: string): Promise<void> {
    const dish = await this.findOne(id, true);
    // Xóa hết các nguyên liệu liên quan
    await this.dishIngredientRepository.delete({ dishId: id });
    // Xóa món ăn
    await this.dishRepository.delete(id);
  }
}
