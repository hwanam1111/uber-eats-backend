import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories-dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateMenuInput, CreateMenuOutput } from './dtos/create-menu.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { DeleteMenuInput, DeleteMenuOutput } from './dtos/delete-menu.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { EditMenuInput, EditMenuOutput } from './dtos/edit-menu.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantsInput,
  SearchRestaurantsOutput,
} from './dtos/search-reataurant.dto';
import { Category } from './entities/category.entity';
import { Menu } from './entities/menu.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Menu)
    private readonly menu: Repository<Menu>,
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
  }: RestaurantsInput): Promise<RestaurantsOutput> {
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

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ['menu'],
      });

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      return {
        ok: true,
        result: restaurant,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not load restaurant',
      };
    }
  }

  async searchRestaurants({
    page,
    limit,
    query,
  }: SearchRestaurantsInput): Promise<SearchRestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: ILike(`%${query}%`),
        },
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
        restaurants: restaurants,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not search load restaurants',
      };
    }
  }

  async createMenu(
    owner: User,
    createMenuInput: CreateMenuInput,
  ): Promise<CreateMenuOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        createMenuInput.restaurantId,
      );

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'You can not create a restaurant menu that you do not owner',
        };
      }

      await this.menu.save(
        this.menu.create({ ...createMenuInput, restaurant }),
      );

      return {
        ok: true,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not create menu',
      };
    }
  }

  async editMenu(
    owner: User,
    editMenuInput: EditMenuInput,
  ): Promise<EditMenuOutput> {
    try {
      const menu = await this.menu.findOne(editMenuInput.menuId, {
        relations: ['restaurant'],
      });

      if (!menu) {
        return {
          ok: false,
          error: 'Restaurant menu not found',
        };
      }

      if (owner.id !== menu.restaurant.ownerId) {
        return {
          ok: false,
          error: 'You can not edit a restaurant menu that you do not owner',
        };
      }

      await this.menu.save([
        {
          id: editMenuInput.menuId,
          ...editMenuInput,
        },
      ]);

      return {
        ok: true,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not delete menu',
      };
    }
  }

  async deleteMenu(
    owner: User,
    deleteMenuInput: DeleteMenuInput,
  ): Promise<DeleteMenuOutput> {
    try {
      const menu = await this.menu.findOne(deleteMenuInput.menuId, {
        relations: ['restaurant'],
      });

      if (!menu) {
        return {
          ok: false,
          error: 'Restaurant menu not found',
        };
      }

      if (owner.id !== menu.restaurant.ownerId) {
        return {
          ok: false,
          error: 'You can not delete a restaurant menu that you do not owner',
        };
      }

      await this.menu.delete({ id: deleteMenuInput.menuId });

      return {
        ok: true,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not delete menu',
      };
    }
  }
}
