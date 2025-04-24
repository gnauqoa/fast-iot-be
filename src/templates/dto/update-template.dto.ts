// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreatetemplateDto } from './create-template.dto';

export class UpdateTemplateDto extends PartialType(CreatetemplateDto) {}
