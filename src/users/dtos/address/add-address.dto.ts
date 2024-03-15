import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class AddAddressDto {

  @ApiProperty()
  @IsString()
  @IsOptional()
  houseNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  street: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  city: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  district: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  pincode: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  landmark: string;
}