import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterInsert,
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
} from '../../../../domain/device-status.enum';
import { DeviceRole, DeviceRoleMap } from '../../../../domain/device-role.enum';

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

  @Column({ type: 'int', default: DeviceStatus.OFFLINE })
  @Transform(
    ({ value }) => {
      if (typeof value === 'string') {
        return value === 'online' ? DeviceStatus.ONLINE : DeviceStatus.OFFLINE;
      }
      return DeviceStatusMap[value as DeviceStatus] || 'offline';
    },
    { toPlainOnly: true },
  )
  status: number;

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

  @Column({ type: 'varchar', unique: true })
  @Exclude()
  deviceKey: string;

  @Column({ type: 'varchar', nullable: false })
  @Exclude()
  deviceToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashDeviceToken() {
    this.deviceKey = this.deviceKey ?? crypto.randomBytes(16).toString('hex');
    this.deviceToken = await bcrypt.hash(
      this.deviceToken ?? crypto.randomBytes(16).toString('hex'),
      10,
    );
  }

  @BeforeUpdate()
  async hashDeviceTokenOnUpdate() {
    if (this.deviceToken) {
      this.deviceToken = await bcrypt.hash(this.deviceToken, 10);
    }
  }
}
