import { BeforeInsert, Column, Entity } from 'typeorm';
import { CoreEntity } from 'src/common/entities/common.entity';
import * as bcrypt from 'bcryptjs';
import {
  ObjectType,
  InputType,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import { InternalServerErrorException } from '@nestjs/common';

enum UserRole {
  Client,
  Owner,
  Delivery,
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field(() => String)
  email: string;

  @Column()
  @Field(() => String)
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  @Field(() => UserRole)
  role: UserRole;

  @BeforeInsert()
  async hashPassowrd(): Promise<void> {
    try {
      this.password = await bcrypt.hash(this.password, 11);
    } catch (err) {
      console.log(err);
      throw InternalServerErrorException;
    }
  }
}
