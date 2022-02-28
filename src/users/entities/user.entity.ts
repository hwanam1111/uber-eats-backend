import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { CoreEntity } from 'src/common/entities/common.entity';
import * as bcrypt from 'bcryptjs';
import {
  ObjectType,
  InputType,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';

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
  @Column({ unique: true })
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field(() => String)
  @IsString()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(() => Boolean)
  @IsBoolean()
  verified: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassowrd(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 11);
      } catch (err) {
        console.log(err);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(enteredPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(enteredPassword, this.password);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }
}
