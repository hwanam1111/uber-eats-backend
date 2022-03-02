import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import {
  PagenationInput,
  PagenationOutput,
} from 'src/common/dtos/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class SearchRestaurantsInput extends PagenationInput {
  @Field(() => String)
  @IsString()
  query: string;
}

@ObjectType()
export class SearchRestaurantsOutput extends PagenationOutput {
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
