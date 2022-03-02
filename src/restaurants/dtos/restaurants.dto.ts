import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PagenationInput,
  PagenationOutput,
} from 'src/common/dtos/pagination.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@InputType()
export class RestaurantsInput extends PagenationInput {}

@ObjectType()
export class RestaurantsOutput extends PagenationOutput {
  @Field(() => [Restaurant], { nullable: true })
  results?: Restaurant[];
}
