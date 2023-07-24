import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OptionalAuthorRequest {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly authorId?: number;
}
