import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

@ArgsType()
export class CreateRestaurantDto {
  @Field(() => String)
  @Length(2, 10)
  name: string;

  @Field(() => Boolean)
  @IsBoolean()
  isVegan: string;

  @Field(() => String)
  @IsString()
  address: string;

  @Field(() => String)
  @IsString()
  @Length(2, 10)
  ownerName: string;
}
