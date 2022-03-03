import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length, IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/common.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('MenuOptionInputType', { isAbstract: true })
@ObjectType()
class MenuOption {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => [String])
  @IsString()
  choice: string[];

  @Field(() => Number)
  @IsNumber()
  extra: number;
}

@InputType('MenuInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Menu extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(1)
  name: string;

  @Field(() => Number)
  @Column()
  @IsNumber()
  price: number;

  @Field(() => String)
  @Column()
  @IsString()
  photo: string;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 150)
  description: string;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  @RelationId((menu: Menu) => menu.restaurant)
  restaurantId: number;

  @Field(() => [MenuOption])
  @Column({ type: 'json' })
  options: MenuOption[];
}
