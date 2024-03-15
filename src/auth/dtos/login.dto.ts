import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {

  @ApiProperty({ example: 'test@test.com'})
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Test123!!@'})
  @IsString()
  @IsNotEmpty()
  password: string;
}