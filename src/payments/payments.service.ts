import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { LessThan, Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'You are not allowd to do this',
        };
      }

      await this.payments.save(
        this.payments.create({
          transactionId,
          restaurant,
          user: owner,
        }),
      );

      const date = new Date();
      date.setDate(date.getDate() + 7);

      restaurant.isPromoted = true;
      restaurant.promotedUntil = date;

      await this.restaurants.save(restaurant);

      return {
        ok: true,
      };
    } catch (err) {
      return {
        ok: false,
        error: 'Could not create payment',
      };
    }
  }

  async getPayments(owner: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({
        user: owner,
      });

      return {
        ok: true,
        payments,
      };
    } catch (err) {
      return {
        ok: false,
        error: 'Could not get payments',
      };
    }
  }

  @Interval(2000)
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurants.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    });

    restaurants.forEach(async (restaurant) => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;

      await this.restaurants.save(restaurant);
    });
  }
}
