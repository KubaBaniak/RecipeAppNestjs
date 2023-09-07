import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class Verify2FARequest {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @ApiProperty()
  token: string;
}
