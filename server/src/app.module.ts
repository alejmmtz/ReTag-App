import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CartsModule } from './bags/bags.module';
import { EventsModule } from './events/events.module';
import { PostsModule } from './posts/posts.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { GarmentsModule } from './garments/garments.module';
import { StoresModule } from './stores/stores.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersStatisticsController } from './users/users-statistics.controller';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UsersModule,
    StoresModule,
    GarmentsModule,
    CatalogsModule,
    PostsModule,
    EventsModule,
    CartsModule,
    TransactionsModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [AppController, UsersStatisticsController],
  providers: [AppService],
})
export class AppModule {}
