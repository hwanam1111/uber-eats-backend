import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from 'src/restaurants/entities/menu.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Menu)
    private readonly menu: Repository<Menu>,
  ) {}

  async createOrder(
    customer: User,
    { restaurntId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurntId);

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      const orderItems: OrderItem[] = [];
      let orderFinalPrice = 0;

      for (const item of items) {
        const menu = await this.menu.findOne(item.menuId);

        if (!menu) {
          return {
            ok: false,
            error: 'Menu not found',
          };
        }

        let menuFinalPrice = menu.price;

        if (item.options) {
          for (const itemOption of item.options) {
            const menuOption = menu.options.find(
              (menuOption) => menuOption.name === itemOption.name,
            );

            if (menuOption) {
              if (menuOption.extra) {
                menuFinalPrice += menuOption.extra;
              } else {
                const menuOptionChoice = menuOption.choices.find(
                  (choice) => choice.name === itemOption.choice,
                );

                if (menuOptionChoice?.extra) {
                  menuFinalPrice += menuOptionChoice.extra;
                }
              }
            }
          }
        }
        orderFinalPrice += menuFinalPrice;

        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            menu,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }

      await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );

      return {
        ok: true,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not create order',
      };
    }
  }
}
