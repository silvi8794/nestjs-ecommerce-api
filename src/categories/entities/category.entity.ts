import { 
    Column, 
    Entity, 
    PrimaryGeneratedColumn, 
    OneToMany, 
    BeforeInsert, 
    BeforeUpdate 
} from "typeorm";
import { Product } from "../../products/entities/product.entity";

@Entity({ name: 'categories' })
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true, nullable: true })
    slug: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => Product, (product) => product.category)
    products: Product[];

    @BeforeInsert()
    @BeforeUpdate()
    generateSlug() {
      this.slug = this.name
        .toLowerCase()
        .normalize('NFD') // Normalizamos para quitar acentos
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-') // Espacios por -
        .replace(/[^\w-]+/g, '') // Quitamos caracteres especiales
        .replace(/--+/g, '-') // Quitamos -- extras
        .replace(/^-+/, '') // Quitamos - al inicio
        .replace(/-+$/, ''); // Quitamos - al final
    }
}
