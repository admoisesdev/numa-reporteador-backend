import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { REGEX } from 'src/common';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(REGEX.password, {
    message:
      'El password debe tener al menos un número, una letra mayúscula, una letra minúscula y un símbolo.',
  })
  newPassword: string;
}
