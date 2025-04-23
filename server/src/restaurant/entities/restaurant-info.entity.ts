import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('restaurant_info')
export class RestaurantInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 255 })
  opening_hours: string;
}