import { IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { CreateAuthUserDto } from 'src/auth/dto';

export class CreateUserDto extends CreateAuthUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    type: [String],
    example: ['admin', 'user', 'jefe-credito', 'asesor-credito'],
  })
  @IsArray()
  @IsOptional()
  roles?: string[];

  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  @IsArray()
  companyIds: number[];
}
