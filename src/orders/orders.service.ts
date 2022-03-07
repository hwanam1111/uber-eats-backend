import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from 'src/restaurants/entities/menu.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';

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

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: user,
            ...(status && { status }),
          },
        });
      }

      if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: user,
            ...(status && { status }),
          },
        });
      }

      if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: {
            owner: user,
          },
          relations: ['orders'],
        });
        orders = restaurants.map((restaurant) => restaurant.orders).flat(1);

        if (status) {
          orders = orders.filter((order) => order.status === status);
        }
      }

      return {
        ok: true,
        orders,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not get orders',
      };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      return false;
    }

    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      return false;
    }

    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      return false;
    }

    return true;
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'],
      });

      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: 'You can not see that',
        };
      }

      return {
        ok: true,
        order,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not get order',
      };
    }
  }

  canEdit(user: User, status: OrderStatus): boolean {
    if (user.role === UserRole.Client) {
      return false;
    }

    if (user.role === UserRole.Owner) {
      if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
        return false;
      }
    }

    if (user.role === UserRole.Delivery) {
      if (status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered) {
        return false;
      }
    }

    return true;
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'],
      });

      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: 'You can not see that',
        };
      }

      if (!this.canEdit(user, status)) {
        return {
          ok: false,
          error: 'You can not edit that',
        };
      }

      await this.orders.save([
        {
          id: orderId,
          status,
        },
      ]);

      return {
        ok: true,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not edit order',
      };
    }
  }
}
