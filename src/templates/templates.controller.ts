import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Template } from './domain/template';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { FindAllTemplatesDto } from './dto/find-all-templates.dto';
import { TemplateOwnershipGuard } from './template-ownership.guard';

@ApiTags('Templates')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'templates',
  version: '1',
})
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiCreatedResponse({
    type: Template,
  })
  create(@Body() createTemplateDto: CreateTemplateDto, @Request() req) {
    return this.templatesService.create(createTemplateDto, req.user.id);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Template),
  })
  async findAll(
    @Query() query: FindAllTemplatesDto,
    @Request() req,
  ): Promise<InfinityPaginationResponseDto<Template>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const { data, total } = await this.templatesService.findAll(
      { ...query, page, limit },
      req.user.id,
    );

    return {
      data,
      total,
      count: data.length,
      pageCount: Math.ceil(total / limit),
    };
  }

  @Get(':id')
  @UseGuards(TemplateOwnershipGuard)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Template,
  })
  findById(@Param('id') id: string) {
    return this.templatesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(TemplateOwnershipGuard)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Template,
  })
  update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @UseGuards(TemplateOwnershipGuard)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
