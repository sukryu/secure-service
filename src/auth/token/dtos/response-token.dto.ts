import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class ResponseTokenDto {
  @ApiProperty({ example: 'token'})
  @IsString()
  @IsOptional()
  access_token?: string;

  @ApiProperty({ example: 'token'})
  @IsString()
  @IsOptional()
  refresh_token?: string;
}