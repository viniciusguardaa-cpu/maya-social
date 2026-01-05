import { IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BatchGenerationOptionsDto {
  @ApiProperty({
    description: 'Generate AI briefs for all planned content items',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  generateBriefs?: boolean;

  @ApiProperty({
    description: 'Generate AI art/creative content for all items (requires briefs)',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  generateArts?: boolean;

  @ApiProperty({
    description: 'Automatically approve generated content (skip approval workflow)',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  autoApprove?: boolean;
}

export class GenerateMonthPlanDto {
  @ApiProperty({
    description: 'Year for the calendar month',
    example: 2025,
  })
  @IsNumber()
  @Type(() => Number)
  year: number;

  @ApiProperty({
    description: 'Month for the calendar (1-12)',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;

  @ApiProperty({
    description: 'Options for automatic batch generation after creating the plan',
    required: false,
    type: BatchGenerationOptionsDto,
  })
  @IsOptional()
  autoGenerate?: BatchGenerationOptionsDto;
}

export class BatchGenerateSelectedDto {
  @ApiProperty({
    description: 'Array of content item IDs to process',
    type: [String],
    example: ['clx123abc', 'clx456def'],
  })
  contentItemIds: string[];

  @ApiProperty({
    description: 'Batch generation options',
    type: BatchGenerationOptionsDto,
  })
  options: BatchGenerationOptionsDto;
}
