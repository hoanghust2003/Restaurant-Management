import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  contact_name: string;

  @Column({ length: 20 })
  contact_phone: string;

  @Column({ length: 255 })
  contact_email: string;

  @Column('text')
  address: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
