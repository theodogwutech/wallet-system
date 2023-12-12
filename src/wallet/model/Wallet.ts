import Users from '../../users/model/Users';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum WalletStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, { eager: true })
  user: Users;

  @Column()
  walletAccountNo: string;

  @Column({ enum: Object.values(WalletStatus), default: WalletStatus.ACTIVE })
  status: string;

  @Column({ default: 0 })
  balance: number;

  @Column({ default: 0 })
  balanceBefore: number;

  @Column({ default: 0 })
  balanceAfter: number;

  @Column({ default: 0 })
  lastDebitAmount: number;

  @Column({ default: 0 })
  lastCreditAmount: number;

  @Column({ default: null })
  lastDebitDate: Date;

  @Column({ default: null })
  lastDepositDate: Date;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}

export default Wallet;
