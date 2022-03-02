import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PagenationInput,
  PagenationOutput,
} from 'src/common/dtos/pagination.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Category } from 'src/restaurants/entities/category.entity';

@InputType()
export class CategoryInput extends PagenationInput {
  @Field(() => String)
  slug: string;
}

@ObjectType()
export class CategoryOutput extends PagenationOutput {
  @Field(() => Category, { nullable: true })
  category?: Category;

  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
