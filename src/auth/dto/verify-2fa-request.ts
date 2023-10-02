import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Verify2FARequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  token: string;
}
