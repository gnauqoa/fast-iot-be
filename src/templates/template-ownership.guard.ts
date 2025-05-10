import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { RoleEnum } from '../roles/roles.enum';

@Injectable()
export class TemplateOwnershipGuard implements CanActivate {
  constructor(private readonly templatesService: TemplatesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const templateId = request.params.id;

    if (!user || !templateId) {
      throw new ForbiddenException('Invalid request');
    }

    const userId: number = user.id;
    const userRoleId: number = user.role.id;
    const template = await this.templatesService.findById(templateId);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (
      userRoleId !== RoleEnum.admin &&
      template.userId !== userId &&
      !template.public
    ) {
      throw new ForbiddenException(
        'Permission denied: You can only access your own templates or public templates',
      );
    }

    request.template = template;

    return true;
  }
}
