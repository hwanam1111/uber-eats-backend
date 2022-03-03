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

  @Field(() => [String], { nullable: true })
  @IsString()
  choices?: string[];

  @Field(() => Number, { nullable: true })
  @IsNumber()
  extra?: number;
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
  @Column({ nullable: true })
  @IsNumber()
  price: number;

  @Field(() => String)
  @Column({ nullable: true })
  @IsString()
  photo?: string;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 150)
  description: string;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  restaurant: Restaurant;

  @RelationId((menu: Menu) => menu.restaurant)
  restaurantId: number;

  @Field(() => [MenuOption])
  @Column({ type: 'json', nullable: true })
  options?: MenuOption[];
}
