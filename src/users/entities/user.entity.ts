import { Column, Entity } from 'typeorm';
import { CoreEntity } from 'src/common/entities/common.entity';

type UserRole = 'client' | 'owner' | 'delivery';

@Entity()
export class User extends CoreEntity {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: UserRole;
}
