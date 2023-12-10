import Users from 'src/users/model/Users';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

@Entity()
export class Transactions {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, { eager: true })
  user: Users;

  @Column()
  amount: number;

  @Column()
  walletBalanceBefore: number;

  @Column()
  walletBalanceAfter: number;

  @Column({ nullable: true })
  sender: number;

  @Column({ nullable: true })
  receiver: number;

  @Column()
  reference: string;

  @Column()
  description: string;

  @Column()
  transactionHash: string;

  @Column({ enum: Object.values(TransactionType) })
  transactionType: string;

  @Column()
  transactionDate: Date;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}

export default Transactions;
