import { ApiProperty, PartialType } from "@nestjs/swagger";
import { AddAddressDto } from "./add-address.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateAddressDto extends PartialType(AddAddressDto) {
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