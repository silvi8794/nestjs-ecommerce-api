import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
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
import { CartsModule } from './carts/carts.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    CacheModule.register({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 3307),
        username: configService.get<string>('DATABASE_USER', 'root'),
        password: configService.get<string>('DATABASE_PASSWORD', 'rootpassword'),
        database: configService.get<string>('DATABASE_NAME', 'nestjs_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    RoleModule,
    AuthModule,
    ProductsModule,
    ColorsModule,
    CategoriesModule,
    BrandsModule,
    CartsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
