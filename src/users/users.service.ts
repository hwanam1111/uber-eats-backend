import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateAccountInput } from './dtos/create-account.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    try {
      const existsUser = await this.users.findOne({ email });
      if (existsUser) {
        return {
          ok: false,
          error: 'There is a user with that email already',
        };
      }

      await this.users.save(this.users.create({ email, password, role }));

      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: 'Could not create account',
      };
    }
  }
}
