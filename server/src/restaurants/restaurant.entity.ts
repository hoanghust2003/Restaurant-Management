import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column('text')
  address: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ nullable: true, length: 255 })
  logo_url: string;

  @Column({ nullable: true, length: 255 })
  cover_image_url: string;

  @CreateDateColumn()
  created_at: Date;
}
