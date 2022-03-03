import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import {
  CategoryResolver,
  MenuResolver,
  RestaurantResolver,
} from './restaurants.resolver';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import { CategoryRepository } from './repositories/category.repository';
import { Menu } from './entities/menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository, Menu])],
  providers: [
    RestaurantResolver,
    RestaurantService,
    CategoryResolver,
    MenuResolver,
  ],
})
export class RestaurantsModule {}
