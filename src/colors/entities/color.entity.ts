import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { ProductVariant } from "../../products/entities/product-variant.entity";

@Entity({ name: 'colors' })
export class Color {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    hexCode: string;

    @OneToMany(() => ProductVariant, (variant) => variant.color)
    variants: ProductVariant[];
}
