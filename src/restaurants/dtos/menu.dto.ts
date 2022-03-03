import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PagenationInput,
  PagenationOutput,
} from 'src/common/dtos/pagination.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Menu } from 'src/restaurants/entities/menu.entity';

@InputType()
export class MenuInput extends PagenationInput {
  @Field(() => String)
  slug: string;
}

@ObjectType()
export class MenuOutput extends PagenationOutput {
  @Field(() => Menu, { nullable: true })
  menu?: Menu;

  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
