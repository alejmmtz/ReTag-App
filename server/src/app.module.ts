import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CartsModule } from './carts/carts.module';
import { EventsModule } from './events/events.module';
import { PostsModule } from './posts/posts.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { GarmentsModule } from './garments/garments.module';
import { StoresModule } from './stores/stores.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, StoresModule, GarmentsModule, CatalogsModule, PostsModule, EventsModule, CartsModule, TransactionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
