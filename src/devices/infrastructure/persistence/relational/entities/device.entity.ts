import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
  DeleteDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { PostGISPoint } from '../../../../../database/types/postgis.types';
import { Exclude, Transform } from 'class-transformer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  DeviceStatus,
  DeviceStatusMap,
  DeviceStatusStr,
} from '../../../../domain/device-status.enum';
import { DeviceRole, DeviceRoleMap } from '../../../../domain/device-role.enum';
import { Channel } from '../../../../../channels/domain/channel';
import { Template } from '../../../../../templates/domain/template';

@Entity({
  name: 'device',
})
export class DeviceEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdate: Date;

  @Column({
    type: 'int',
    default: DeviceStatus.OFFLINE,
    transformer: {
      to: (value: string) =>
        DeviceStatus[value ? value.toUpperCase() : 'OFFLINE'],
      from: (value: number) => DeviceStatusMap[value as DeviceStatus],
    },
  })
  status: DeviceStatusStr;

  @Column('geometry', { spatialFeatureType: 'Point', srid: 4326 })
  position: PostGISPoint;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @Column()
  userId: number;

  @Column({ type: 'int', default: DeviceRole.DEVICE })
  @Transform(({ value }) => DeviceRoleMap[value as DeviceRole] || 'device')
  @Exclude()
  role: number;

  channels?: Channel[];

  @Column({ type: 'varchar', unique: true })
  @Exclude()
  deviceKey: string;

  @Column({ type: 'varchar', nullable: false })
  @Exclude()
  deviceToken: string;

  template?: Template;

  @Column({ type: 'varchar', nullable: true })
  templateId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  async hashDeviceToken() {
    this.deviceKey = this.deviceKey ?? crypto.randomBytes(16).toString('hex');
    this.deviceToken = await bcrypt.hash(
      this.deviceToken ?? crypto.randomBytes(16).toString('hex'),
      10,
    );
  }
}
