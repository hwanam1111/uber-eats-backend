import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PagenationInput,
  PagenationOutput,
} from 'src/common/dtos/pagination.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@InputType()
export class ReataurantsInput extends PagenationInput {}

@ObjectType()
export class ReataurantsOutput extends PagenationOutput {
  @Field(() => [Restaurant], { nullable: true })
  results?: Restaurant[];
}
