import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { REGEX } from 'src/common';

export class CreateCompanyDto {
  @ApiProperty()
  @IsString()
  @Matches(REGEX.ruc, {
    message: 'El RUC debe tener 13 dígitos.',
  })
  ruc: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  businessName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  project?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  commercial?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  establishment?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  legalRepresentative?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  resolutionDate?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
