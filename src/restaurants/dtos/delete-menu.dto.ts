import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteMenuInput {
  @Field(() => Number)
  @IsNumber()
  menuId: number;
}

@ObjectType()
export class DeleteMenuOutput extends CoreOutput {}
