import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories-dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { ReataurantsInput, ReataurantsOutput } from './dtos/restaurants.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );

      newRestaurant.category = category;
      newRestaurant.owner = owner;

      await this.restaurants.save(newRestaurant);

      return {
        ok: true,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: {
          id: editRestaurantInput.restaurantId,
        },
        loadRelationIds: true,
      });

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'You can not edit a restaurant that you do not owner',
        };
      }

      let category: Category | null = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }

      this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);

      return {
        ok: true,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not edit restaurant',
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: {
          id: restaurantId,
        },
        loadRelationIds: true,
      });

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'You can not delete a restaurant that you do not owner',
        };
      }

      await this.restaurants.softDelete(restaurantId);

      return {
        ok: true,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not delete restaurant',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();

      return {
        ok: true,
        categories,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not load categories',
      };
    }
  }

  async countRestaurant(category: Category): Promise<number> {
    try {
      return await this.restaurants.count({
        where: {
          category,
        },
      });
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  async findCategoryBySlug({
    slug,
    page,
    limit,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });

      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }

      const restaurants = await this.restaurants.find({
        where: {
          category,
        },
        take: limit,
        skip: (page - 1) * limit,
        order: {
          id: 'DESC',
        },
      });

      const totalResults = await this.countRestaurant(category);

      return {
        ok: true,
        totalPages: Math.ceil(totalResults / limit),
        category,
        restaurants,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }

  async allRestaurants({
    page,
    limit,
  }: ReataurantsInput): Promise<ReataurantsOutput> {
    try {
      const [results, totalResults] = await this.restaurants.findAndCount({
        take: limit,
        skip: (page - 1) * limit,
        order: {
          id: 'DESC',
        },
      });

      return {
        ok: true,
        totalResults,
        totalPages: Math.ceil(totalResults / limit),
        results,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }
}
