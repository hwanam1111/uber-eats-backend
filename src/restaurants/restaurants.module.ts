import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { RestaurantResolver } from './restaurants.resolver';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';
import { CategoryRepository } from './repositories/category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])],
  providers: [RestaurantResolver, RestaurantService],
})
export class RestaurantsModule {}
