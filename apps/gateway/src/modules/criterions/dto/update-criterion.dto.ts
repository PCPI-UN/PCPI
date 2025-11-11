import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCriterionDto } from './create-criterion.dto';

export class UpdateCriterionDto extends PartialType(CreateCriterionDto) {}
