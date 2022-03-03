import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { CreateMenuInput } from './create-menu.dto';

@InputType()
export class EditMenuInput extends PickType(PartialType(CreateMenuInput), [
  'name',
  'options',
  'price',
  'description',
]) {
  @Field(() => Number)
  @IsNumber()
  menuId: number;
}

@ObjectType()
export class EditMenuOutput extends CoreOutput {}
