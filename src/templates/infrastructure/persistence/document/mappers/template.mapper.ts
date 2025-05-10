import { Template } from '../../../../domain/template';
import { Templates } from '../entities/template.schema';

export class TemplateMapper {
  public static toDomain(raw: Templates): Template {
    const domainEntity = new Template();
    // Map basic fields
    domainEntity.id = raw._id.toString();
    domainEntity.name = raw.name;
    domainEntity.description = raw.description;
    domainEntity.userId = raw.userId;
    domainEntity.public = raw.public;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt || null;

    // Map channels
    domainEntity.channels = raw.channels.map((channel) => ({
      name: channel.name,
      type: channel.type,
    }));

    // Map desktop prototype if exists

    domainEntity.desktopPrototype = raw?.desktopPrototype;

    // Map mobile prototype if exists
    domainEntity.mobilePrototype = raw?.mobilePrototype;

    return domainEntity;
  }

  public static toPersistence(domainEntity: Template): Templates {
    const persistenceSchema = new Templates();

    // Map basic fields
    if (domainEntity.id) {
      persistenceSchema._id = domainEntity.id;
    }
    persistenceSchema.name = domainEntity.name;
    persistenceSchema.public = domainEntity.public;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deletedAt = domainEntity.deletedAt || null;

    // Map channels
    persistenceSchema.channels = domainEntity.channels.map((channel) => ({
      name: channel.name,
      type: channel.type,
    }));

    // Map desktop prototype if exists
    if (domainEntity.desktopPrototype) {
      persistenceSchema.desktopPrototype = {
        viewport: {
          x: domainEntity.desktopPrototype.viewport.x,
          y: domainEntity.desktopPrototype.viewport.y,
          zoom: domainEntity.desktopPrototype.viewport.zoom,
        },
        nodes: domainEntity.desktopPrototype.nodes,
        edges: domainEntity.desktopPrototype.edges,
      };
    }

    // Map mobile prototype if exists
    if (domainEntity.mobilePrototype) {
      persistenceSchema.mobilePrototype = {
        viewport: {
          x: domainEntity.mobilePrototype.viewport.x,
          y: domainEntity.mobilePrototype.viewport.y,
          zoom: domainEntity.mobilePrototype.viewport.zoom,
        },
        nodes: domainEntity.mobilePrototype.nodes,
        edges: domainEntity.mobilePrototype.edges,
      };
    }

    return persistenceSchema;
  }
}
