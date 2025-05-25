import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';

async function seedDatabase() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  try {
    const restaurantRepository = dataSource.getRepository(Restaurant);
    
    // Kiểm tra xem đã có dữ liệu chưa
    const existingRestaurant = await restaurantRepository.findOne({
      where: {},
    });

    if (!existingRestaurant) {
      const restaurant = restaurantRepository.create({
        name: 'Nhà hàng ABC Restaurant',
        address: '123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM',
        phone: '0901234567',
        logo_url: 'https://example.com/logo.png',
        cover_image_url: 'https://example.com/cover.jpg',
      });

      await restaurantRepository.save(restaurant);
      console.log('✅ Seeded restaurant data successfully');
      console.log('Restaurant ID:', restaurant.id);
    } else {
      console.log('ℹ️ Restaurant data already exists');
      console.log('Existing restaurant:', existingRestaurant);
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await app.close();
  }
}

seedDatabase();
