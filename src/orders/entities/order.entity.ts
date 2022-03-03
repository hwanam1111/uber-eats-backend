import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/common.entity';
import { Menu } from 'src/restaurants/entities/menu.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (customer) => customer.orders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  customer?: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (driver) => driver.rides, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  driver?: User;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  restaurant?: Restaurant;

  @Field(() => [Menu])
  @ManyToMany(() => Menu)
  @JoinTable()
  menu: Menu[];

  @Field(() => Number)
  @Column()
  total: number;

  @Field(() => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;
}
