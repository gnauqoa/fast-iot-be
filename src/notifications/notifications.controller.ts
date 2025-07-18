import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Patch,
  Request,
  Delete,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Notification } from './domain/notification';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { FindAllnotificationsDto } from './dto/find-all-notifications.dto';
import { NotificationOwnershipGuard } from './notification-ownership.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'notifications',
  version: '1',
})
export class notificationsController {
  constructor(private readonly NotificationsService: NotificationsService) {}

  @Get('unread')
  @ApiOkResponse({
    type: Number,
  })
  async getUnreadCount(@Request() req) {
    return {
      count: await this.NotificationsService.getUnreadCount(req.user.id),
    };
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Notification),
  })
  async findAll(
    @Query() query: FindAllnotificationsDto,
    @Request() req,
  ): Promise<InfinityPaginationResponseDto<Notification>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const { data, total } =
      await this.NotificationsService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
        userId: req.user.id,
      });

    return {
      data,
      total,
      count: data.length,
      pageCount: Math.ceil(total / limit),
    };
  }

  @Get(':id')
  @UseGuards(NotificationOwnershipGuard)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Notification,
  })
  findById(@Param('id') id: string) {
    return this.NotificationsService.findById(id);
  }

  @Patch(':id/read')
  @UseGuards(NotificationOwnershipGuard)
  async markAsRead(@Param('id') id: string) {
    return this.NotificationsService.updateIsRead(id);
  }

  @Patch('read')
  async markAsReadAll(@Request() req) {
    return this.NotificationsService.updateIsReadAll(req.user.id.toString());
  }

  @Delete(':id')
  @UseGuards(NotificationOwnershipGuard)
  async delete(@Param('id') id: string) {
    return this.NotificationsService.delete(id);
  }
}
