import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'Administrator' })
  name: string;

  @Column()
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
