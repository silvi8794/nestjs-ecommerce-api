import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { ColorsModule } from './colors/colors.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las configuraciones estén disponibles globalmente
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Importa el ConfigModule para acceder a las variables de entorno
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get<string>('DATABASE_HOST', 'localhost'), // Valores predeterminados
        port: configService.get<number>('DATABASE_PORT', 3307),
        username: configService.get<string>('DATABASE_USER', 'root'),
        password: configService.get<string>('DATABASE_PASSWORD', 'rootpassword'),
        database: configService.get<string>('DATABASE_NAME', 'nestjs_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService], // Inyecta ConfigService para acceder a las variables
    }),
    UsersModule,
    RoleModule,
    AuthModule,
    ProductsModule,
    ColorsModule,
    CategoriesModule,
    BrandsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
