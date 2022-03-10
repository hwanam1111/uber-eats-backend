import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { IncludeSoftDeleteCoreEntity } from 'src/common/entities/common.entity';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Category } from './category.entity';
import { Menu } from './menu.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends IncludeSoftDeleteCoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(1)
  name: string;

  @Field(() => String)
  @Column()
  @IsString()
  address: string;

  @Field(() => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field(() => Category)
  @ManyToOne(() => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.restaurants, { onDelete: 'CASCADE' })
  owner: User;

  @RelationId((resturant: Restaurant) => resturant.owner)
  ownerId: number;

  @Field(() => [Menu])
  @OneToMany(() => Menu, (menu) => menu.restaurant)
  menu: Menu[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.restaurant)
  orders: Order[];

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  isPromoted: boolean;

  @Field(() => Date)
  @Column({ nullable: true })
  promotedUntil?: Date;
}
