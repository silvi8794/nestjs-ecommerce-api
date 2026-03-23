import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { CartItem } from './cart-item.entity';

export enum CartStatus {
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    READY_TO_PICK = 'READY_TO_PICK',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum DeliveryMethod {
    PICKUP = 'PICKUP',
    SHIPPING = 'SHIPPING' // se habilitará más adelante
}

export enum PaymentMethod {
    CASH = 'CASH',
    TRANSFER = 'TRANSFER',
    NONE = 'NONE'
}

@Entity({ name: 'carts' })
export class Cart {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { nullable: true })
    user: User;

    @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
    items: CartItem[];

    @Column({
        type: 'enum',
        enum: CartStatus,
        default: CartStatus.ACTIVE
    })
    status: CartStatus;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.NONE
    })
    paymentMethod: PaymentMethod;

    @Column({ nullable: true })
    receiptUrl: string;

    @Column({
        type: 'enum',
        enum: DeliveryMethod,
        default: DeliveryMethod.PICKUP
    })
    deliveryMethod: DeliveryMethod;

    @Column({ type: 'json', nullable: true })
    aiAnalysis: any;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalAmount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
