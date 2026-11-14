import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import {User} from './user.entity'
import {Permission} from './permission.entity'
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';

@Entity({name: SCHEMA_NAMES.ROLES})
export class Role extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: Permission[];

  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users!: User[];
}
