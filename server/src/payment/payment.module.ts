import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Payment } from './entities/payment.entity';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { VnpayService } from './services/vnpay.service';
import { FinancialRecord } from '../entities/financial-record.entity';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, FinancialRecord]),
    ConfigModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'restaurant_management_secure_jwt_secret_key_2025',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => OrdersModule),
  ],
  controllers: [PaymentController],  
  providers: [PaymentService, VnpayService],
  exports: [PaymentService],
})
export class PaymentModule {}
