import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

// Entities
import { User } from './user/entities/user.entity';
import { RoleEnum } from './user/entities/role.enum';
import { Table, TableStatus } from './table/entities/table.entity';
import { Category } from './menu-item/entities/category.entity';
import { Dish } from './menu-item/entities/dish.entity';
import { Unit } from './inventory/entities/unit.entity';
import { Ingredient } from './inventory/entities/ingredient.entity';
import { DishIngredient } from './inventory/entities/dish-ingredient.entity';
import { Menu } from './menu-item/entities/menu.entity';
import { MenuDish } from './menu-item/entities/menu-dish.entity';
import { Order, OrderStatus } from './order/entities/order.entity';
import { OrderItem, OrderItemStatus } from './order/entities/order-item.entity';
import { RestaurantInfo } from './restaurant/entities/restaurant-info.entity';
import { Feedback } from './order/entities/feedback.entity';
import { KitchenLog } from './order/entities/kitchen-log.entity';
import { KitchenAction } from './order/dto/create-kitchen-log.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Get repositories
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const tableRepository = app.get<Repository<Table>>(getRepositoryToken(Table));
  const categoryRepository = app.get<Repository<Category>>(getRepositoryToken(Category));
  const dishRepository = app.get<Repository<Dish>>(getRepositoryToken(Dish));
  const unitRepository = app.get<Repository<Unit>>(getRepositoryToken(Unit));
  const ingredientRepository = app.get<Repository<Ingredient>>(getRepositoryToken(Ingredient));
  const dishIngredientRepository = app.get<Repository<DishIngredient>>(getRepositoryToken(DishIngredient));
  const menuRepository = app.get<Repository<Menu>>(getRepositoryToken(Menu));
  const menuDishRepository = app.get<Repository<MenuDish>>(getRepositoryToken(MenuDish));
  const orderRepository = app.get<Repository<Order>>(getRepositoryToken(Order));
  const orderItemRepository = app.get<Repository<OrderItem>>(getRepositoryToken(OrderItem));
  const restaurantInfoRepository = app.get<Repository<RestaurantInfo>>(getRepositoryToken(RestaurantInfo));
  const feedbackRepository = app.get<Repository<Feedback>>(getRepositoryToken(Feedback));
  const kitchenLogRepository = app.get<Repository<KitchenLog>>(getRepositoryToken(KitchenLog));
  
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await kitchenLogRepository.delete({});
    await feedbackRepository.delete({});
    await orderItemRepository.delete({});
    await orderRepository.delete({});
    await dishIngredientRepository.delete({});
    await menuDishRepository.delete({});
    await dishRepository.delete({});
    await menuRepository.delete({});
    await ingredientRepository.delete({});
    await unitRepository.delete({});
    await categoryRepository.delete({});
    await tableRepository.delete({});
    await userRepository.delete({});
    await restaurantInfoRepository.delete({});
    
    console.log('Database cleared');
    
    // 1. Create restaurant info
    const restaurantInfo = restaurantInfoRepository.create({
      name: 'Gourmet Bistro',
      description: 'A modern restaurant offering exquisite cuisine with a fusion of traditional and contemporary flavors.',
      address: '123 Culinary Street, Foodie City',
      phone: '+1 (555) 123-4567',
      opening_hours: 'Mon-Fri: 10:00-22:00, Sat-Sun: 11:00-23:00'
    });
    await restaurantInfoRepository.save(restaurantInfo);
    console.log('Restaurant info created');
    
    // 2. Create users
    const saltRounds = configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
    const defaultPassword = configService.get<string>('DEFAULT_SEED_PASSWORD', 'Password123');
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);
    
    const users = await userRepository.save([
      {
        name: 'admin',
        email: 'admin@restaurant.com',
        password: passwordHash,
        role: RoleEnum.ADMIN,
        isActive: true
      },
      {
        name: 'manager',
        email: 'manager@restaurant.com',
        password: passwordHash,
        role: RoleEnum.MANAGER,
        isActive: true
      },
      {
        name: 'staff',
        email: 'staff@restaurant.com',
        password: passwordHash,
        role: RoleEnum.WAITER,
        isActive: true
      },
      {
        name: 'kitchen',
        email: 'kitchen@restaurant.com',
        password: passwordHash,
        role: RoleEnum.CHEF,
        isActive: true
      },
      {
        name: 'customer',
        email: 'customer@example.com',
        password: passwordHash,
        role: RoleEnum.CUSTOMER,
        isActive: true
      },
      {
        name: 'inactive',
        email: 'inactive@example.com',
        password: passwordHash,
        role: RoleEnum.CUSTOMER,
        isActive: false
      }
    ]);
    console.log('Users created');
    
    // 3. Create tables
    const tables = await tableRepository.save([
      {
        name: 'Table 1',
        capacity: 2,
        status: TableStatus.VACANT
      },
      {
        name: 'Table 2',
        capacity: 4,
        status: TableStatus.VACANT
      },
      {
        name: 'Table 3',
        capacity: 6,
        status: TableStatus.VACANT
      },
      {
        name: 'Table 4',
        capacity: 4,
        status: TableStatus.OCCUPIED
      },
      {
        name: 'Table 5',
        capacity: 8,
        status: TableStatus.RESERVED
      },
      {
        name: 'Bar 1',
        capacity: 2,
        status: TableStatus.VACANT
      },
      {
        name: 'Bar 2',
        capacity: 2,
        status: TableStatus.OCCUPIED
      },
      {
        name: 'Outdoor 1',
        capacity: 4,
        status: TableStatus.VACANT
      }
    ]);
    console.log('Tables created');
    
    // 4. Create categories
    const categories = await categoryRepository.save([
      {
        name: 'Appetizer',
        description: 'Starters and small dishes'
      },
      {
        name: 'Main Course',
        description: 'Primary dishes'
      },
      {
        name: 'Dessert',
        description: 'Sweet dishes to complete your meal'
      },
      {
        name: 'Beverage',
        description: 'Drinks and refreshments'
      },
      {
        name: 'Side Dish',
        description: 'Accompaniments to main courses'
      }
    ]);
    console.log('Categories created');
    
    // 5. Create units
    const units = await unitRepository.save([
      {
        name: 'Kilogram',
        abbreviation: 'kg'
      },
      {
        name: 'Gram',
        abbreviation: 'g'
      },
      {
        name: 'Liter',
        abbreviation: 'L'
      },
      {
        name: 'Milliliter',
        abbreviation: 'ml'
      },
      {
        name: 'Piece',
        abbreviation: 'pcs'
      },
      {
        name: 'Tablespoon',
        abbreviation: 'tbsp'
      },
      {
        name: 'Teaspoon',
        abbreviation: 'tsp'
      },
      {
        name: 'Cup',
        abbreviation: 'cup'
      }
    ]);
    console.log('Units created');
    
    // 6. Create ingredients
    const currentDate = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const nextTwoMonths = new Date();
    nextTwoMonths.setMonth(nextTwoMonths.getMonth() + 2);
    
    const ingredients = await ingredientRepository.save([
      {
        name: 'Chicken Breast',
        unitId: units[0].id, // kg
        current_quantity: 10.5,
        threshold: 5,
        expiry_date: nextMonth,
        supplier: 'Premium Meats Inc.',
        batch_code: 'CH-2025-04-01'
      },
      {
        name: 'Rice',
        unitId: units[0].id, // kg
        current_quantity: 25,
        threshold: 10,
        expiry_date: nextTwoMonths,
        supplier: 'Global Grains Ltd.',
        batch_code: 'RC-2025-03-15'
      },
      {
        name: 'Tomato',
        unitId: units[4].id, // pcs
        current_quantity: 30,
        threshold: 15,
        expiry_date: nextWeek,
        supplier: 'Fresh Farms',
        batch_code: 'TM-2025-04-24'
      },
      {
        name: 'Olive Oil',
        unitId: units[2].id, // L
        current_quantity: 4.5,
        threshold: 2,
        expiry_date: nextTwoMonths,
        supplier: 'Mediterranean Imports',
        batch_code: 'OO-2025-01-10'
      },
      {
        name: 'Flour',
        unitId: units[0].id, // kg
        current_quantity: 15,
        threshold: 8,
        expiry_date: nextTwoMonths,
        supplier: 'Baking Supplies Co.',
        batch_code: 'FL-2025-05-20'
      },
      {
        name: 'Sugar',
        unitId: units[0].id, // kg
        current_quantity: 8,
        threshold: 5,
        expiry_date: nextTwoMonths,
        supplier: 'Sweet Ingredients Inc.',
        batch_code: 'SG-2025-06-15'
      },
      {
        name: 'Salt',
        unitId: units[1].id, // g
        current_quantity: 2000,
        threshold: 500,
        expiry_date: nextTwoMonths,
        supplier: 'Seasoning Supplies',
        batch_code: 'ST-2025-09-10'
      },
      {
        name: 'Pepper',
        unitId: units[1].id, // g
        current_quantity: 1500,
        threshold: 300,
        expiry_date: nextTwoMonths,
        supplier: 'Seasoning Supplies',
        batch_code: 'PP-2025-08-05'
      },
      {
        name: 'Milk',
        unitId: units[2].id, // L
        current_quantity: 8,
        threshold: 5,
        expiry_date: nextWeek,
        supplier: 'Dairy Farms Inc.',
        batch_code: 'MK-2025-04-27'
      },
      {
        name: 'Cheese',
        unitId: units[0].id, // kg
        current_quantity: 3,
        threshold: 1.5,
        expiry_date: nextWeek,
        supplier: 'Artisanal Cheese Makers',
        batch_code: 'CH-2025-04-29'
      },
      {
        name: 'Garlic',
        unitId: units[4].id, // pcs
        current_quantity: 40,
        threshold: 10,
        expiry_date: nextMonth,
        supplier: 'Fresh Farms',
        batch_code: 'GR-2025-04-15'
      },
      {
        name: 'Onion',
        unitId: units[4].id, // pcs
        current_quantity: 20,
        threshold: 10,
        expiry_date: nextMonth,
        supplier: 'Fresh Farms',
        batch_code: 'ON-2025-04-20'
      },
      {
        name: 'Beef',
        unitId: units[0].id, // kg
        current_quantity: 3.5,
        threshold: 4,  // Deliberately set below current to test alerts
        expiry_date: nextWeek,
        supplier: 'Premium Meats Inc.',
        batch_code: 'BF-2025-04-28'
      },
      {
        name: 'Chocolate',
        unitId: units[0].id, // kg
        current_quantity: 2,
        threshold: 1,
        expiry_date: nextTwoMonths,
        supplier: 'Sweet Ingredients Inc.',
        batch_code: 'CC-2025-07-10'
      },
      {
        name: 'Coffee Beans',
        unitId: units[0].id, // kg
        current_quantity: 5,
        threshold: 2,
        expiry_date: nextTwoMonths,
        supplier: 'Mountain Coffee Co.',
        batch_code: 'CF-2025-05-15'
      }
    ]);
    console.log('Ingredients created');
    
    // 7. Create dishes
    const dishes = await dishRepository.save([
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with creamy Caesar dressing, croutons, and parmesan cheese',
        categoryId: categories[0].id, // Appetizer
        price: 8.99,
        preparation_time: 10,
        is_available: true,
        requires_preparation: true
      },
      {
        name: 'Tomato Soup',
        description: 'Classic tomato soup made with fresh tomatoes and herbs',
        categoryId: categories[0].id, // Appetizer
        price: 6.99,
        preparation_time: 15,
        is_available: true,
        requires_preparation: true
      },
      {
        name: 'Grilled Chicken Breast',
        description: 'Tender chicken breast marinated and grilled to perfection',
        categoryId: categories[1].id, // Main Course
        price: 14.99,
        preparation_time: 20,
        is_available: true,
        requires_preparation: true
      },
      {
        name: 'Beef Steak',
        description: 'Prime beef steak grilled to your liking served with sauce',
        categoryId: categories[1].id, // Main Course
        price: 22.99,
        preparation_time: 25,
        is_available: true,
        requires_preparation: true
      },
      {
        name: 'Pasta Carbonara',
        description: 'Classic Italian pasta with creamy sauce, pancetta, and parmesan',
        categoryId: categories[1].id, // Main Course
        price: 12.99,
        preparation_time: 15,
        is_available: true,
        requires_preparation: true
      },
      {
        name: 'Chocolate Cake',
        description: 'Decadent chocolate cake with rich frosting',
        categoryId: categories[2].id, // Dessert
        price: 7.99,
        preparation_time: 5,
        is_available: true,
        requires_preparation: false
      },
      {
        name: 'Tiramisu',
        description: 'Italian dessert with layers of coffee-soaked ladyfingers and mascarpone',
        categoryId: categories[2].id, // Dessert
        price: 8.99,
        preparation_time: 5,
        is_available: true,
        requires_preparation: false
      },
      {
        name: 'Fresh Lemonade',
        description: 'Freshly squeezed lemonade with mint',
        categoryId: categories[3].id, // Beverage
        price: 3.99,
        preparation_time: 5,
        is_available: true,
        requires_preparation: true
      },
      {
        name: 'Cappuccino',
        description: 'Espresso with steamed milk and foam',
        categoryId: categories[3].id, // Beverage
        price: 4.99,
        preparation_time: 5,
        is_available: true,
        requires_preparation: true
      },
      {
        name: 'French Fries',
        description: 'Crispy golden fries served with ketchup',
        categoryId: categories[4].id, // Side Dish
        price: 3.99,
        preparation_time: 10,
        is_available: true,
        requires_preparation: true
      },
      {
        name: 'Seasonal Vegetable Mix',
        description: 'Fresh seasonal vegetables sautéed with herbs',
        categoryId: categories[4].id, // Side Dish
        price: 4.99,
        preparation_time: 10,
        is_available: true,
        requires_preparation: true
      },
      {
        name: 'Seafood Paella',
        description: 'Traditional Spanish rice dish with various seafood',
        categoryId: categories[1].id, // Main Course
        price: 18.99,
        preparation_time: 30,
        is_available: false, // Unavailable dish for testing
        requires_preparation: true
      }
    ]);
    console.log('Dishes created');
    
    // 8. Create dish-ingredient relations
    await dishIngredientRepository.save([
      // Caesar Salad
      {
        dishId: dishes[0].id,
        ingredientId: ingredients[2].id, // Tomato
        quantityPerServing: 2
      },
      {
        dishId: dishes[0].id,
        ingredientId: ingredients[9].id, // Cheese
        quantityPerServing: 0.05
      },
      
      // Tomato Soup
      {
        dishId: dishes[1].id,
        ingredientId: ingredients[2].id, // Tomato
        quantityPerServing: 3
      },
      {
        dishId: dishes[1].id,
        ingredientId: ingredients[3].id, // Olive Oil
        quantityPerServing: 0.02
      },
      {
        dishId: dishes[1].id,
        ingredientId: ingredients[6].id, // Salt
        quantityPerServing: 5
      },
      
      // Grilled Chicken Breast
      {
        dishId: dishes[2].id,
        ingredientId: ingredients[0].id, // Chicken Breast
        quantityPerServing: 0.2
      },
      {
        dishId: dishes[2].id,
        ingredientId: ingredients[3].id, // Olive Oil
        quantityPerServing: 0.01
      },
      {
        dishId: dishes[2].id,
        ingredientId: ingredients[6].id, // Salt
        quantityPerServing: 3
      },
      {
        dishId: dishes[2].id,
        ingredientId: ingredients[7].id, // Pepper
        quantityPerServing: 2
      },
      
      // Beef Steak
      {
        dishId: dishes[3].id,
        ingredientId: ingredients[12].id, // Beef
        quantityPerServing: 0.25
      },
      {
        dishId: dishes[3].id,
        ingredientId: ingredients[3].id, // Olive Oil
        quantityPerServing: 0.01
      },
      {
        dishId: dishes[3].id,
        ingredientId: ingredients[6].id, // Salt
        quantityPerServing: 3
      },
      {
        dishId: dishes[3].id,
        ingredientId: ingredients[7].id, // Pepper
        quantityPerServing: 2
      },
      
      // Pasta Carbonara
      {
        dishId: dishes[4].id,
        ingredientId: ingredients[4].id, // Flour (for pasta)
        quantityPerServing: 0.1
      },
      {
        dishId: dishes[4].id,
        ingredientId: ingredients[8].id, // Milk
        quantityPerServing: 0.05
      },
      {
        dishId: dishes[4].id,
        ingredientId: ingredients[9].id, // Cheese
        quantityPerServing: 0.03
      },
      
      // Chocolate Cake
      {
        dishId: dishes[5].id,
        ingredientId: ingredients[4].id, // Flour
        quantityPerServing: 0.05
      },
      {
        dishId: dishes[5].id,
        ingredientId: ingredients[5].id, // Sugar
        quantityPerServing: 0.04
      },
      {
        dishId: dishes[5].id,
        ingredientId: ingredients[13].id, // Chocolate
        quantityPerServing: 0.03
      },
      
      // Tiramisu
      {
        dishId: dishes[6].id,
        ingredientId: ingredients[5].id, // Sugar
        quantityPerServing: 0.03
      },
      {
        dishId: dishes[6].id,
        ingredientId: ingredients[8].id, // Milk
        quantityPerServing: 0.05
      },
      {
        dishId: dishes[6].id,
        ingredientId: ingredients[14].id, // Coffee Beans
        quantityPerServing: 0.01
      },
      
      // Fresh Lemonade
      {
        dishId: dishes[7].id,
        ingredientId: ingredients[5].id, // Sugar
        quantityPerServing: 0.02
      },
      
      // Cappuccino
      {
        dishId: dishes[8].id,
        ingredientId: ingredients[8].id, // Milk
        quantityPerServing: 0.1
      },
      {
        dishId: dishes[8].id,
        ingredientId: ingredients[14].id, // Coffee Beans
        quantityPerServing: 0.02
      },
      
      // French Fries
      {
        dishId: dishes[9].id,
        ingredientId: ingredients[6].id, // Salt
        quantityPerServing: 3
      },
      {
        dishId: dishes[9].id,
        ingredientId: ingredients[3].id, // Olive Oil
        quantityPerServing: 0.03
      },
      
      // Seasonal Vegetable Mix
      {
        dishId: dishes[10].id,
        ingredientId: ingredients[2].id, // Tomato
        quantityPerServing: 1
      },
      {
        dishId: dishes[10].id,
        ingredientId: ingredients[10].id, // Garlic
        quantityPerServing: 2
      },
      {
        dishId: dishes[10].id,
        ingredientId: ingredients[11].id, // Onion
        quantityPerServing: 0.5
      },
      
      // Seafood Paella
      {
        dishId: dishes[11].id,
        ingredientId: ingredients[1].id, // Rice
        quantityPerServing: 0.1
      },
      {
        dishId: dishes[11].id,
        ingredientId: ingredients[3].id, // Olive Oil
        quantityPerServing: 0.02
      },
      {
        dishId: dishes[11].id,
        ingredientId: ingredients[10].id, // Garlic
        quantityPerServing: 1
      }
    ]);
    console.log('Dish-Ingredient relationships created');
    
    // 9. Create menus
    const menus = await menuRepository.save([
      {
        name: 'Main Menu',
        description: 'Our standard offerings available all day',
        is_active: true
      },
      {
        name: 'Lunch Special',
        description: 'Special discounted items available from 11:00 to 15:00',
        is_active: true
      },
      {
        name: 'Kids Menu',
        description: 'Specially crafted dishes for our younger guests',
        is_active: true
      },
      {
        name: 'Seasonal Menu',
        description: 'Limited time offerings featuring seasonal ingredients',
        is_active: false
      }
    ]);
    console.log('Menus created');
    
    // 10. Associate dishes with menus
    interface MenuDish {
      menuId: string;
      dishId: string;
    }
    const menuDishes: MenuDish[] = [];
    
    // Add all dishes to main menu
    for (const dish of dishes) {
      menuDishes.push({
        menuId: menus[0].id,
        dishId: dish.id
      });
    }
    
    // Add select dishes to lunch special
    menuDishes.push(
      {
        menuId: menus[1].id,
        dishId: dishes[0].id // Caesar Salad
      },
      {
        menuId: menus[1].id,
        dishId: dishes[1].id // Tomato Soup
      },
      {
        menuId: menus[1].id,
        dishId: dishes[2].id // Grilled Chicken
      },
      {
        menuId: menus[1].id,
        dishId: dishes[4].id // Pasta Carbonara
      },
      {
        menuId: menus[1].id,
        dishId: dishes[7].id // Lemonade
      }
    );
    
    // Add select dishes to kids menu
    menuDishes.push(
      {
        menuId: menus[2].id,
        dishId: dishes[4].id // Pasta Carbonara
      },
      {
        menuId: menus[2].id,
        dishId: dishes[5].id // Chocolate Cake
      },
      {
        menuId: menus[2].id,
        dishId: dishes[7].id // Lemonade
      },
      {
        menuId: menus[2].id,
        dishId: dishes[9].id // French Fries
      }
    );
    
    // Add seasonal dish to seasonal menu
    menuDishes.push(
      {
        menuId: menus[3].id,
        dishId: dishes[11].id // Seafood Paella
      }
    );
    
    await menuDishRepository.save(menuDishes);
    console.log('Menu-Dish relationships created');
    
    // 11. Create sample orders
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const orders = await orderRepository.save([
      {
        tableId: tables[0].id,
        status: OrderStatus.COMPLETED,
        totalAmount: 31.97,
        createdAt: threeDaysAgo,
        customerId: users[4].id // customer user
      },
      {
        tableId: tables[1].id,
        status: OrderStatus.COMPLETED,
        totalAmount: 45.96,
        createdAt: twoDaysAgo,
        specialInstructions: 'No spicy ingredients, please.'
      },
      {
        tableId: tables[2].id,
        status: OrderStatus.COMPLETED,
        totalAmount: 22.97,
        createdAt: yesterday,
        customerId: users[4].id // customer user
      },
      {
        tableId: tables[3].id,
        status: OrderStatus.IN_PROGRESS,
        totalAmount: 53.95,
        createdAt: new Date(),
        specialInstructions: 'Allergy to nuts.'
      },
      {
        tableId: tables[6].id,
        status: OrderStatus.PENDING,
        totalAmount: 13.98,
        createdAt: new Date()
      }
    ]) as Order[];
    console.log('Orders created');

    // 12. Create order items
    const orderItems = await this.orderItemRepository.save([
      // Order 1
      {
        orderId: orders[0].id,
        dishId: dishes[0].id, // Caesar Salad
        quantity: 1,
        status: OrderItemStatus.DELIVERED,
        prepared_at: threeDaysAgo,
        note: null
      },
      {
        orderId: orders[0].id,
        dishId: dishes[2].id, // Grilled Chicken
        quantity: 1,
        status: OrderItemStatus.READY,
        prepared_at: threeDaysAgo,
        note: 'Well done, please.'
      },
      {
        orderId: orders[0].id,
        dishId: dishes[7].id, // Lemonade
        quantity: 2,
        status: OrderItemStatus.DELIVERED,
        prepared_at: threeDaysAgo,
        note: 'One with extra sugar.'
      },
      
      // Order 2
      {
        orderId: orders[1].id,
        dishId: dishes[1].id, // Tomato Soup
        quantity: 2,
        status: OrderItemStatus.PENDING,
        prepared_at: twoDaysAgo,
        note: null
      },
      {
        orderId: orders[1].id,
        dishId: dishes[3].id, // Beef Steak
        quantity: 1,
        status: OrderItemStatus.CANCELED,
        prepared_at: twoDaysAgo,
        note: 'Medium rare.'
      },
      {
        orderId: orders[1].id,
        dishId: dishes[9].id, // French Fries
        quantity: 1,
        status: OrderItemStatus.DELIVERED,
        prepared_at: twoDaysAgo,
        note: 'Extra crispy.'
      },
      {
        orderId: orders[1].id,
        dishId: dishes[8].id, // Cappuccino
        quantity: 2,
        status: OrderItemStatus.READY,
        prepared_at: twoDaysAgo,
        note: null
      },
      
      // Order 3
      {
        orderId: orders[2].id,
        dishId: dishes[4].id, // Pasta Carbonara
        quantity: 1,
        status: OrderItemStatus.DELIVERED,
        prepared_at: yesterday,
        note: 'Extra cheese.'
      },
      {
        orderId: orders[2].id,
        dishId: dishes[5].id, // Chocolate Cake
        quantity: 1,
        status: OrderItemStatus.DELIVERED,
        prepared_at: yesterday,
        note: null
      },
      {
        orderId: orders[2].id,
        dishId: dishes[8].id, // Cappuccino
        quantity: 1,
        status: OrderItemStatus.DELIVERED,
        prepared_at: yesterday,
        note: 'With almond milk if possible.'
      },
      
      // Order 4 (In Progress)
      {
        orderId: orders[3].id,
        dishId: dishes[0].id, // Caesar Salad
        quantity: 1,
        status: OrderItemStatus.DELIVERED,
        prepared_at: new Date(new Date().getTime() - 10 * 60000), // 10 minutes ago
        note: null
      },
      {
        orderId: orders[3].id,
        dishId: dishes[3].id, // Beef Steak
        quantity: 2,
        status: OrderItemStatus.PREPARING,
        prepared_at: null,
        note: 'One medium, one well done.'
      },
      {
        orderId: orders[3].id,
        dishId: dishes[10].id, // Seasonal Vegetable Mix
        quantity: 1,
        status: OrderItemStatus.PREPARING,
        prepared_at: null,
        note: null
      },
      {
        orderId: orders[3].id,
        dishId: dishes[7].id, // Lemonade
        quantity: 2,
        status: OrderItemStatus.DELIVERED,
        prepared_at: new Date(new Date().getTime() - 12 * 60000), // 12 minutes ago
        note: null
      },
      
      // Order 5 (Pending)
      {
        orderId: orders[4].id,
        dishId: dishes[4].id, // Pasta Carbonara
        quantity: 1,
        status: OrderItemStatus.PENDING,
        prepared_at: null,
        note: null
      },
      {
        orderId: orders[4].id,
        dishId: dishes[8].id, // Cappuccino
        quantity: 1,
        status: OrderItemStatus.PENDING,
        prepared_at: null,
        note: 'Extra shot of espresso.'
      }
    ]);
    console.log('Order Items created');
    
    // 13. Create feedback for completed orders
    await feedbackRepository.save([
      {
        userId: users[4].id, // customer
        orderId: orders[0].id,
        rating: 4,
        comment: 'Food was great! Service could be a bit faster.'
      },
      {
        userId: users[4].id, // customer
        orderId: orders[2].id,
        rating: 5,
        comment: 'Amazing experience! The pasta was perfectly cooked.'
      }
    ]);
    console.log('Feedback created');
    
    // 14. Create kitchen logs
    await kitchenLogRepository.save([
      {
        orderItemId: orderItems[11].id, // Beef Steak in Order 4
        userId: users[3].id, // kitchen user
        action: KitchenAction.STARTED,
        timestamp: new Date(new Date().getTime() - 15 * 60000) // 15 minutes ago
      },
      {
        orderItemId: orderItems[12].id, // Vegetable Mix in Order 4
        userId: users[3].id, // kitchen user
        action: KitchenAction.STARTED,
        timestamp: new Date(new Date().getTime() - 12 * 60000) // 12 minutes ago
      },
      {
        orderItemId: orderItems[10].id, // Salad in Order 4
        userId: users[3].id, // kitchen user
        action: KitchenAction.STARTED,
        timestamp: new Date(new Date().getTime() - 15 * 60000) // 15 minutes ago
      },
      {
        orderItemId: orderItems[10].id, // Salad in Order 4
        userId: users[3].id, // kitchen user
        action: KitchenAction.COMPLETED,
        timestamp: new Date(new Date().getTime() - 10 * 60000) // 10 minutes ago
      }
    ]);
    console.log('Kitchen Logs created');
    
    console.log('Database seeding completed successfully');
    
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap();