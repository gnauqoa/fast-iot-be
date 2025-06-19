import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Patch,
  Body,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Notification } from './domain/Notification';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { FindAllnotificationsDto } from './dto/find-all-notifications.dto';
import { infinityPagination } from '../utils/pagination';
import { NotificationOwnershipGuard } from './notification-ownership.guard';
import { BulkMarkAsReadDto } from './dto/bulk-mark-as-read.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'notifications',
  version: '1',
})
export class notificationsController {
  constructor(private readonly NotificationsService: NotificationsService) {}

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Notification),
  })
  async findAll(
    @Query() query: FindAllnotificationsDto,
    @Request() req,
  ): Promise<
    InfinityPaginationResponseDto<Notification> & { unreadCount: number }
  > {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return {
      ...infinityPagination(
        await this.NotificationsService.findAllWithPagination({
          paginationOptions: {
            page,
            limit,
          },
          userId: req.user.id,
        }),
        { page, limit },
      ),
      unreadCount: await this.NotificationsService.getUnreadCount(req.user.id),
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
}
