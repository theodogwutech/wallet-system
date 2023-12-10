import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { IsEmail, IsLowercase, IsNotEmpty, Length } from 'class-validator';

@Entity({ name: 'users' })
export class Users {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column()
  @IsNotEmpty()
  firstName: string;

  @Column()
  @IsNotEmpty()
  lastName: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @Length(4, 20)
  @IsEmail()
  @IsLowercase()
  email: string;

  @Column({ default: null })
  @Length(4, 100)
  password: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isDisabled: boolean;

  @Column({ default: '' })
  profilePicture: string;

  @Column({ default: false })
  isDeleted: boolean;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @DeleteDateColumn()
  deletedAt: Date;
}

export default Users;
