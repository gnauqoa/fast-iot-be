import {
  Controller,
  Get,
  Request,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import {
  Crud,
  CrudController,
  CrudRequest,
  Override,
  ParsedBody,
  ParsedRequest,
  GetManyDefaultResponse,
} from '@dataui/crud';
import { DeviceEntity } from './infrastructure/persistence/relational/entities/device.entity';
import { DevicesService } from './devices.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleEnum } from '../roles/roles.enum';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { AuthGuard } from '@nestjs/passport';
import { SCondition } from '@dataui/crud-request/lib/types/request-query.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DeviceOwnershipGuard } from './device-ownership.guard';
import crypto from 'crypto';
import { DeviceRole } from './domain/device-role.enum';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ScanDevicesDto } from './dto/scan-devices.dto';
import { DeviceStatusStr } from './domain/device-status.enum';
import bcrypt from 'bcryptjs';
import { ChannelsService } from '../channels/channels.service';
import { TemplateRepository } from '../templates/infrastructure/persistence/template.repository';
import { getChannelDefaultValue } from '../utils/channel';
import { Template } from '../templates/domain/template';

type DeviceWithTemplate = {
  id: number;
  name: string;
  lastUpdate: Date;
  status: string;
  position: any;
  user: any;
  userId: number;
  role: number;
  channels?: any[];
  deviceKey: string;
  deviceToken: string;
  templateId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  template: Template | null;
};

interface DevicesResponse {
  data: DeviceWithTemplate[];
  count: number;
  total: number;
  page: number;
  pageCount: number;
}

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Crud({
  model: { type: DeviceEntity },
  dto: {
    update: UpdateDeviceDto,
    create: CreateDeviceDto,
  },
  query: {
    alwaysPaginate: true,
    maxLimit: 100,
    limit: 10,
    cache: 0,
    softDelete: true,
    join: {
      user: { eager: true },
      template: { eager: true },
    },
    sort: [{ field: 'lastUpdate', order: 'DESC' }],
  },

  routes: {
    exclude: ['replaceOneBase', 'recoverOneBase'],
  },
})
@ApiTags('Devices')
@Controller({ path: 'devices', version: '1' })
export class DevicesController implements CrudController<DeviceEntity> {
  constructor(
    public service: DevicesService,
    @InjectRepository(DeviceEntity) public repo: Repository<DeviceEntity>,
    private readonly channelService: ChannelsService,
    private readonly templateRepository: TemplateRepository,
  ) {}

  get base(): CrudController<DeviceEntity> {
    return this;
  }

  @Get('scan')
  async scanDevices(@Query() query: ScanDevicesDto, @Request() request: any) {
    const userRoleId: number = request.user.role.id;

    return this.service.scanNearbyDevices({
      ...query,
      radius: userRoleId === RoleEnum.admin ? query.radius : 10000,
      status:
        userRoleId === RoleEnum.admin ? query.status : DeviceStatusStr.ONLINE,
    });
  }

  @Override('getManyBase')
  @Roles(RoleEnum.admin)
  async ovGetManyBase(
    @ParsedRequest() req: CrudRequest,
    @Request() request: any,
  ): Promise<DevicesResponse> {
    const user = request.user;
    const userId: number = user.id;
    const userRoleId: number = user.role.id;

    const searchFilters = this.createSearchFilters(
      req.parsed.search,
      userId,
      userRoleId,
    );
    req.parsed.search = { $and: searchFilters };

    const devices = (await this.service.getMany({
      ...req,
      parsed: {
        ...req.parsed,
        search: {
          $and: searchFilters || [],
        },
      },
    })) as GetManyDefaultResponse<DeviceEntity>;

    // Get template IDs from devices
    const templateIds = devices.data
      .filter((device) => device.templateId)
      .map((device) => device.templateId);

    // Fetch templates if there are any template IDs
    let templates: Template[] = [];
    if (templateIds.length > 0) {
      templates = await this.templateRepository.findByIds(templateIds);
    }

    // Create a map of templates by ID for quick lookup
    const templateMap = templates.reduce<Record<string, Template>>(
      (acc, template) => {
        acc[template.id] = template;
        return acc;
      },
      {},
    );

    // Add template information to each device
    const devicesWithTemplates: DevicesResponse = {
      data: devices.data.map((device) => ({
        ...device,
        template: device.templateId ? templateMap[device.templateId] : null,
      })),
      count: devices.count,
      total: devices.total,
      page: devices.page,
      pageCount: devices.pageCount,
    };

    return devicesWithTemplates;
  }

  @Override('getOneBase')
  @UseGuards(DeviceOwnershipGuard)
  ovGetOneBase(@Request() request: any): Promise<DeviceEntity> {
    return {
      ...request.device,
    };
  }

  @Override('updateOneBase')
  @UseGuards(DeviceOwnershipGuard)
  async ovUpdateOneBase(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: UpdateDeviceDto,
  ): Promise<DeviceEntity> {
    return await this.service.updateOne(req, {
      ...dto,
      user: dto.userId ? { id: dto.userId } : undefined,
    });
  }

  @Get(':id/password')
  @UseGuards(DeviceOwnershipGuard)
  async getDevicePassword(@Request() request: any): Promise<DeviceEntity> {
    const deviceToken = crypto.randomBytes(16).toString('hex');

    await this.repo.update(request.device.id, {
      deviceToken: await bcrypt.hash(deviceToken, 10),
    });

    return {
      ...request.device,
      deviceToken: deviceToken,
    };
  }

  @Override('createOneBase')
  async ovCreateOneBase(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: CreateDeviceDto,
  ): Promise<DeviceEntity> {
    const device = await this.service.createOne(req, {
      ...dto,
    });

    const template = await this.templateRepository.findById(device.templateId);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    for (const channel of template?.channels || []) {
      await this.channelService.create({
        deviceId: device.id,
        name: channel.name,
        value: getChannelDefaultValue(channel.type),
      });
    }

    return device;
  }

  @Override('deleteOneBase')
  @UseGuards(DeviceOwnershipGuard)
  async ovDeleteOneBase(
    @ParsedRequest() req: CrudRequest,
  ): Promise<void | DeviceEntity> {
    return await this.service.deleteOne(req);
  }

  private createSearchFilters(
    parsedSearch: any,
    userId: number,
    userRoleId: number,
  ): SCondition[] {
    const filters: SCondition[] = [];

    // Add device role filter
    filters.push({ role: { $eq: DeviceRole.DEVICE } });

    // Add user-specific filter for non-admin users
    if (userRoleId !== RoleEnum.admin) {
      filters.push({ userId: { $eq: userId } });
    }

    // Add any existing search conditions
    if (parsedSearch?.$and) {
      filters.push(...parsedSearch.$and);
    }

    return filters;
  }
}
