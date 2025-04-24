// src/templates/infrastructure/persistence/relational/entities/template.entity.ts
import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  DeleteDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'template',
})
export class TemplateEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number; // Changed to number to match the migration

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  userId: number;

  @Column({ type: 'json', nullable: true })
  renderData: any; // Adjust type as necessary

  @Column({ type: 'boolean', default: false })
  public: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date; // Soft delete field
}
