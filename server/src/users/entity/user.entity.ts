// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Role } from './role.enum';  // Import the enum

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

  @Column({ nullable: true, length: 255 })
  avatar_url: string;

  @Column({ type: 'enum', enum: Role })  // Use the enum here
  role: Role;

  @CreateDateColumn()
  created_at: Date;
}
