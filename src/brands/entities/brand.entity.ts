import { 
    Column, 
    Entity, 
    PrimaryGeneratedColumn, 
    OneToMany, 
    BeforeInsert, 
    BeforeUpdate 
} from "typeorm";
import { Product } from "../../products/entities/product.entity";

@Entity({ name: 'brands' })
export class Brand {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true, nullable: true })
    slug: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => Product, (product) => product.brand)
    products: Product[];

    @BeforeInsert()
    @BeforeUpdate()
    generateSlug() {
      if (this.name) {
        this.slug = this.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
      }
    }
}
