import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class CoreEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
@Entity()
export class IncludeSoftDeleteCoreEntity extends CoreEntity {
  @Field(() => Boolean)
  @Column({ default: false })
  @IsBoolean()
  isDeleted: boolean;

  @Field(() => Date)
  @Column({ nullable: true })
  @IsBoolean()
  deletedAt: Date;
}
