import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import { MenuItemService } from './menu-item/menu-item.service';
import { TableService } from './table/table.service';
import { OrderService } from './order/order.service';
import { UserRole } from './user/entities/user.entity';
import { MenuItemCategory } from './menu-item/entities/menu-item.entity';
import { TableStatus } from './table/entities/table.entity';
import { OrderStatus } from './order/entities/order.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Lấy các service
  const userService = app.get(UserService);
  const menuItemService = app.get(MenuItemService);
  const tableService = app.get(TableService);
  const orderService = app.get(OrderService);

  console.log('🌱 Bắt đầu tạo dữ liệu mẫu...');

  // Tạo người dùng mẫu
  console.log('📝 Tạo người dùng...');
  try {
    const admin = await userService.create({
      username: 'admin',
      password: 'admin123',
      fullName: 'Admin User',
      email: 'admin@restaurant.com',
      role: UserRole.ADMIN,
      isActive: true,
    });
    console.log(`✅ Đã tạo admin: ${admin.username}`);

    await userService.create({
      username: 'manager',
      password: 'manager123',
      fullName: 'Restaurant Manager',
      email: 'manager@restaurant.com',
      role: UserRole.MANAGER,
      isActive: true,
    });

    await userService.create({
      username: 'chef',
      password: 'chef123',
      fullName: 'Chef Master',
      email: 'chef@restaurant.com',
      role: UserRole.CHEF,
      isActive: true,
    });

    await userService.create({
      username: 'waiter',
      password: 'waiter123',
      fullName: 'Service Staff',
      email: 'waiter@restaurant.com',
      role: UserRole.WAITER,
      isActive: true,
    });

    await userService.create({
      username: 'reception',
      password: 'reception123',
      fullName: 'Front Desk',
      email: 'reception@restaurant.com',
      role: UserRole.RECEPTION,
      isActive: true,
    });
  } catch (error) {
    console.log('⚠️ Lỗi khi tạo người dùng (có thể đã tồn tại):', error.message);
  }

  // Tạo bàn ăn mẫu
  console.log('📝 Tạo các bàn ăn...');
  try {
    for (let i = 1; i <= 10; i++) {
      const status = i <= 7 
        ? TableStatus.AVAILABLE 
        : (i === 8 ? TableStatus.OCCUPIED : (i === 9 ? TableStatus.RESERVED : TableStatus.CLEANING));
      
      const capacity = i % 3 === 0 ? 6 : (i % 2 === 0 ? 4 : 2);
      
      const table = await tableService.create({
        tableNumber: `T${i.toString().padStart(2, '0')}`,
        status,
        capacity,
      });
      
      // Tạo QR code cho bàn
      await tableService.generateQRCode(table.id);
      console.log(`✅ Đã tạo bàn: ${table.tableNumber} (${table.status})`);
    }
  } catch (error) {
    console.log('⚠️ Lỗi khi tạo bàn:', error.message);
  }

  // Tạo menu items
  console.log('📝 Tạo món ăn...');
  try {
    // Khai vị
    const appetizers = [
      {
        name: 'Súp bí đỏ',
        description: 'Súp bí đỏ kem tươi với hạt bí rang',
        price: 65000,
        category: MenuItemCategory.APPETIZER,
        preparationTimeMinutes: 10,
        imageUrl: 'https://example.com/images/pumpkin-soup.jpg',
      },
      {
        name: 'Gỏi cuốn tôm thịt',
        description: 'Gỏi cuốn tươi với tôm, thịt heo, rau thơm và bún',
        price: 85000,
        category: MenuItemCategory.APPETIZER,
        preparationTimeMinutes: 15,
        imageUrl: 'https://example.com/images/spring-rolls.jpg',
      },
      {
        name: 'Salad Ceasar',
        description: 'Salad trộn với sốt Ceasar, bánh mì nướng và phô mai parmesan',
        price: 95000,
        category: MenuItemCategory.APPETIZER,
        preparationTimeMinutes: 10,
        imageUrl: 'https://example.com/images/caesar-salad.jpg',
      },
    ];

    // Món chính
    const mainCourses = [
      {
        name: 'Bò hầm rượu vang',
        description: 'Thịt bò hầm với rau củ và rượu vang đỏ, dùng kèm bánh mì',
        price: 245000,
        category: MenuItemCategory.MAIN_COURSE,
        preparationTimeMinutes: 30,
        imageUrl: 'https://example.com/images/beef-stew.jpg',
      },
      {
        name: 'Cá hồi nướng',
        description: 'Cá hồi Na Uy nướng với sốt chanh dây, dùng kèm khoai tây nghiền và rau củ',
        price: 235000,
        category: MenuItemCategory.MAIN_COURSE,
        preparationTimeMinutes: 25,
        imageUrl: 'https://example.com/images/salmon.jpg',
      },
      {
        name: 'Mỳ Ý sốt bò bằm',
        description: 'Mỳ Spaghetti với sốt thịt bò bằm và phô mai parmesan',
        price: 165000,
        category: MenuItemCategory.MAIN_COURSE,
        preparationTimeMinutes: 20,
        imageUrl: 'https://example.com/images/spaghetti.jpg',
      },
      {
        name: 'Gà nướng lá chanh',
        description: 'Đùi gà nướng với lá chanh và sả, dùng kèm cơm trắng và rau luộc',
        price: 185000,
        category: MenuItemCategory.MAIN_COURSE,
        preparationTimeMinutes: 30,
        imageUrl: 'https://example.com/images/lemongrass-chicken.jpg',
        isAvailable: false,
      },
    ];

    // Tráng miệng
    const desserts = [
      {
        name: 'Bánh flan',
        description: 'Bánh flan vị cà phê với caramel',
        price: 65000,
        category: MenuItemCategory.DESSERT,
        preparationTimeMinutes: 5,
        imageUrl: 'https://example.com/images/flan.jpg',
      },
      {
        name: 'Cheesecake chanh dây',
        description: 'Bánh cheesecake mát lạnh với sốt chanh dây',
        price: 85000,
        category: MenuItemCategory.DESSERT,
        preparationTimeMinutes: 5,
        imageUrl: 'https://example.com/images/cheesecake.jpg',
      },
    ];

    // Đồ uống
    const beverages = [
      {
        name: 'Sinh tố bơ',
        description: 'Sinh tố bơ mát lạnh với đường thốt nốt',
        price: 65000,
        category: MenuItemCategory.BEVERAGE,
        preparationTimeMinutes: 5,
        imageUrl: 'https://example.com/images/avocado-smoothie.jpg',
      },
      {
        name: 'Cà phê phin',
        description: 'Cà phê phin truyền thống, đường riêng',
        price: 45000,
        category: MenuItemCategory.BEVERAGE,
        preparationTimeMinutes: 8,
        imageUrl: 'https://example.com/images/coffee.jpg',
      },
      {
        name: 'Trà hoa cúc',
        description: 'Trà hoa cúc nóng với mật ong',
        price: 50000,
        category: MenuItemCategory.BEVERAGE,
        preparationTimeMinutes: 5,
        imageUrl: 'https://example.com/images/chamomile-tea.jpg',
      },
    ];

    const allMenuItems = [...appetizers, ...mainCourses, ...desserts, ...beverages];
    
    for (const item of allMenuItems) {
      await menuItemService.create(item);
      console.log(`✅ Đã tạo món: ${item.name}`);
    }
  } catch (error) {
    console.log('⚠️ Lỗi khi tạo menu:', error.message);
  }

  // Tạo đơn hàng mẫu
  console.log('📝 Tạo đơn hàng mẫu...');
  try {
    // Lấy tất cả menu items để lấy ID
    const allMenuItems = await menuItemService.findAll();
    
    // Lấy bàn có trạng thái OCCUPIED
    const occupiedTable = await tableService.findByStatus(TableStatus.OCCUPIED);
    
    if (occupiedTable.length > 0) {
      // Tạo đơn hàng cho bàn occupied
      const order = {
        tableId: occupiedTable[0].id,
        items: [
          {
            menuItemId: allMenuItems.find(i => i.name === 'Súp bí đỏ')?.id ?? (() => { throw new Error("Menu item 'Súp bí đỏ' not found"); })(),
            quantity: 2,
            notes: 'Ít muối',
          },
          {
            menuItemId: allMenuItems.find(i => i.name === 'Bò hầm rượu vang')?.id ?? (() => { throw new Error("Menu item 'Bò hầm rượu vang' not found"); })(),
            quantity: 1,
            notes: '',
          },
          {
            menuItemId: allMenuItems.find(i => i.name === 'Cà phê phin')?.id ?? (() => { throw new Error("Menu item 'Cà phê phin' not found"); })(),
            quantity: 2,
            notes: 'Không đường',
          },
        ],
        specialInstructions: 'Khách VIP - Phục vụ nhanh',
      };

      await orderService.create(order);
      console.log('✅ Đã tạo đơn hàng cho bàn occupied');
    }

    // Tạo thêm đơn hàng cho một bàn available (sau đó bàn này sẽ chuyển thành occupied)
    const availableTables = await tableService.findByStatus(TableStatus.AVAILABLE);
    
    if (availableTables.length > 0) {
      const order = {
        tableId: availableTables[0].id,
        items: [
          {
            menuItemId: allMenuItems.find(i => i.name === 'Gỏi cuốn tôm thịt')?.id ?? (() => { throw new Error("Menu item 'Gỏi cuốn tôm thịt' not found"); })(),
            quantity: 1,
            notes: '',
          },
          {
            menuItemId: allMenuItems.find(i => i.name === 'Mỳ Ý sốt bò bằm')?.id ?? (() => { throw new Error("Menu item 'Mỳ Ý sốt bò bằm' not found"); })(),
            quantity: 1,
            notes: 'Nhiều phô mai',
          },
          {
            menuItemId: allMenuItems.find(i => i.name === 'Bánh flan')?.id ?? (() => { throw new Error("Menu item 'Bánh flan' not found"); })(),
            quantity: 1,
            notes: '',
          },
          {
            menuItemId: allMenuItems.find(i => i.name === 'Sinh tố bơ')?.id ?? (() => { throw new Error("Menu item 'Sinh tố bơ' not found"); })(),
            quantity: 1,
            notes: 'Ít đá',
          },
        ],
        specialInstructions: '',
      };

      await orderService.create(order);
      console.log('✅ Đã tạo đơn hàng cho bàn available');
    }

    // Tạo thêm một đơn hàng với trạng thái IN_PROGRESS để test các trạng thái đơn hàng
    if (availableTables.length > 1) {
      const order = {
        tableId: availableTables[1].id,
        items: [
          {
            menuItemId: allMenuItems.find(i => i.name === 'Salad Ceasar')?.id ?? (() => { throw new Error("Menu item 'Salad Ceasar' not found"); })(),
            quantity: 1,
            notes: 'Không hành',
          },
          {
            menuItemId: allMenuItems.find(i => i.name === 'Cá hồi nướng')?.id ?? (() => { throw new Error("Menu item 'Cá hồi nướng' not found"); })(),
            quantity: 2,
            notes: 'Chín vừa',
          }
        ],
        specialInstructions: 'Phục vụ nhanh',
      };

      const createdOrder = await orderService.create(order);
      // Cập nhật trạng thái đơn hàng thành đang chuẩn bị
      await orderService.updateStatus(createdOrder.id, OrderStatus.IN_PROGRESS);
      console.log('✅ Đã tạo đơn hàng IN_PROGRESS');
    }

    // Tạo đơn hàng đã hoàn thành để test lịch sử
    if (availableTables.length > 2) {
      const order = {
        tableId: availableTables[2].id,
        items: [
          {
            menuItemId: allMenuItems.find(i => i.name === 'Trà hoa cúc')?.id ?? (() => { throw new Error("Menu item 'Trà hoa cúc' not found"); })(),
            quantity: 2,
            notes: '',
          }
        ],
        specialInstructions: '',
      };

      const completedOrder = await orderService.create(order);
      // Cập nhật trạng thái đơn hàng thành hoàn thành
      await orderService.updateStatus(completedOrder.id, OrderStatus.COMPLETED);
      console.log('✅ Đã tạo đơn hàng đã hoàn thành');
    }
  } catch (error) {
    console.log('⚠️ Lỗi khi tạo đơn hàng:', error.message);
  }

  console.log('🎉 Đã tạo dữ liệu mẫu thành công!');
  
  await app.close();
}

bootstrap();