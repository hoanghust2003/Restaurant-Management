import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { Feedback } from '../../order/entities/feedback.entity';
import { KitchenLog } from '../../order/entities/kitchen-log.entity';
import { UserRole } from './user-role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Order, order => order.customer)
  orders: Order[];

  @OneToMany(() => Feedback, feedback => feedback.user)
  feedbacks: Feedback[];

  @OneToMany(() => KitchenLog, log => log.user)
  kitchenLogs: KitchenLog[];

  @OneToMany(() => UserRole, userRole => userRole.user)
  userRoles: UserRole[];
}