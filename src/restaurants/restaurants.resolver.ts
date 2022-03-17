import {
  Resolver,
  Args,
  Mutation,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { Category } from './entities/category.entity';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import {
  SearchRestaurantsInput,
  SearchRestaurantsOutput,
} from './dtos/search-reataurant.dto';
import { Menu } from './entities/menu.entity';
import { CreateMenuInput, CreateMenuOutput } from './dtos/create-menu.dto';
import { DeleteMenuInput, DeleteMenuOutput } from './dtos/delete-menu.dto';
import { EditMenuInput, EditMenuOutput } from './dtos/edit-menu.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import {
  MyRestaurantOutput,
  MyRestuarantInput,
} from './dtos/my-restaurant.dto';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateRestaurantOutput)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    const result = await this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
    return result;
  }

  @Mutation(() => EditRestaurantOutput)
  @Role(['Owner'])
  async editRestaurant(
    @AuthUser() authUser: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    const result = await this.restaurantService.editRestaurant(
      authUser,
      editRestaurantInput,
    );
    return result;
  }

  @Mutation(() => DeleteRestaurantOutput)
  @Role(['Owner'])
  async deleteRestaurant(
    @AuthUser() authUser: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    const result = await this.restaurantService.deleteRestaurant(
      authUser,
      deleteRestaurantInput,
    );
    return result;
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(() => Number)
  async restaurantCount(@Parent() category: Category): Promise<number> {
    const result = await this.restaurantService.countRestaurant(category);
    return result;
  }

  @Query(() => AllCategoriesOutput)
  async allCategory(): Promise<AllCategoriesOutput> {
    const result = await this.restaurantService.allCategories();
    return result;
  }

  @Query(() => CategoryOutput)
  async findCategoryBySlug(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    const result = await this.restaurantService.findCategoryBySlug(
      categoryInput,
    );
    return result;
  }

  @Query(() => RestaurantsOutput)
  async allRestaurants(
    @Args('input') restaurantsInput: RestaurantsInput,
  ): Promise<CategoryOutput> {
    const result = await this.restaurantService.allRestaurants(
      restaurantsInput,
    );
    return result;
  }

  @Query(() => RestaurantOutput)
  async findRestaurantById(
    @Args('input') restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    const result = await this.restaurantService.findRestaurantById(
      restaurantInput,
    );
    return result;
  }

  @Query(() => SearchRestaurantsOutput)
  async searchRestaurants(
    @Args('input') searchRestaurantsInput: SearchRestaurantsInput,
  ): Promise<SearchRestaurantsOutput> {
    const result = await this.restaurantService.searchRestaurants(
      searchRestaurantsInput,
    );
    return result;
  }
}

@Resolver(() => Menu)
export class MenuResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateMenuOutput)
  @Role(['Owner'])
  async createMenu(
    @AuthUser() authUser: User,
    @Args('input') createMenuInput: CreateMenuInput,
  ): Promise<CreateMenuOutput> {
    const result = await this.restaurantService.createMenu(
      authUser,
      createMenuInput,
    );
    return result;
  }

  @Mutation(() => EditMenuOutput)
  @Role(['Owner'])
  async editMenu(
    @AuthUser() authUser: User,
    @Args('input') editMenuInput: EditMenuInput,
  ): Promise<EditMenuOutput> {
    const result = await this.restaurantService.editMenu(
      authUser,
      editMenuInput,
    );
    return result;
  }

  @Mutation(() => DeleteMenuOutput)
  @Role(['Owner'])
  async deleteMenu(
    @AuthUser() authUser: User,
    @Args('input') deleteMenuInput: DeleteMenuInput,
  ): Promise<DeleteMenuOutput> {
    const result = await this.restaurantService.deleteMenu(
      authUser,
      deleteMenuInput,
    );
    return result;
  }

  @Query(() => MyRestaurantsOutput)
  @Role(['Owner'])
  myRestaurants(@AuthUser() owner: User): Promise<MyRestaurantsOutput> {
    const result = this.restaurantService.myRestaurants(owner);
    return result;
  }

  @Query(() => MyRestaurantOutput)
  @Role(['Owner'])
  myRestaurant(
    @AuthUser() owner: User,
    @Args('input') myRestuarantInput: MyRestuarantInput,
  ): Promise<MyRestaurantOutput> {
    const result = this.restaurantService.myRestaurant(
      myRestuarantInput,
      owner,
    );
    return result;
  }
}
