import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from './output.dto';

@InputType()
export class PagenationInput {
  @Field(() => Number, { defaultValue: 1 })
  page: number;

  @Field(() => Number, { defaultValue: 10 })
  limit: number;
}

@ObjectType()
export class PagenationOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  totalPages?: number;
}
