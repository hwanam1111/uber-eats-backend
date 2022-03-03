import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Menu } from 'src/restaurants/entities/menu.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CreateMenuInput extends PickType(Menu, [
  'name',
  'price',
  'photo',
  'description',
  'options',
]) {
  @Field(() => Number)
  restaurantId: number;
}

@ObjectType()
export class CreateMenuOutput extends CoreOutput {}
