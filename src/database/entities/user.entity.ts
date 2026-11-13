import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Index } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import {Role} from './role.entity'
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';

@Entity({name: SCHEMA_NAMES.USER})
@Index(['isActive'])
export class User extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  email!: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  nip!: string | null;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: false })
  password!: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl!: string;

  @Column({ name: 'is_email_verified', type: 'boolean', default: true })
  isEmailVerified!: boolean;

  @Column({ name: 'email_verification_token_hash', type: 'varchar', length: 64, nullable: true })
  emailVerificationTokenHash!: string | null;

  @Column({ name: 'email_verification_expires_at', type: 'timestamp with time zone', nullable: true })
  emailVerificationExpiresAt!: Date | null;

  @Column({ name: 'password_reset_token_hash', type: 'varchar', length: 64, nullable: true })
  passwordResetTokenHash!: string | null;

  @Column({ name: 'password_reset_expires_at', type: 'timestamp with time zone', nullable: true })
  passwordResetExpiresAt!: Date | null;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 64, nullable: true })
  refreshTokenHash!: string | null;

  @Column({ name: 'refresh_token_expires_at', type: 'timestamp with time zone', nullable: true })
  refreshTokenExpiresAt!: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'last_login_at', type: 'timestamp with time zone', nullable: true })
  lastLoginAt!: Date;

  @ManyToMany(() => Role, (role) => role.users)
  roles!: Role[];
}
