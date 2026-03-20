import { 
    Column, 
    Entity, 
    PrimaryGeneratedColumn, 
    ManyToOne, 
    JoinColumn,
    Index
} from "typeorm";
import { Product } from "./product.entity";
import { Color } from "../../colors/entities/color.entity";

@Entity({ name: 'product_variants' })
export class ProductVariant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @Index()
    sku: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number;

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ nullable: true })
    size: string; // e.g. "S", "M", "L", "42", etc.

    @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @ManyToOne(() => Color, (color) => color.variants, { nullable: true })
    @JoinColumn({ name: 'colorId' })
    color: Color;
}
