import { ApiProperty } from '@nestjs/swagger';
import { IsBase32, IsNotEmpty } from 'class-validator';

export class Recovery2FARequest {
  @IsNotEmpty()
  @IsBase32()
  @ApiProperty()
  recoveryKey: string;
}
