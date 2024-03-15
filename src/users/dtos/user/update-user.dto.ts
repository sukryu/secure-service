import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 'test123@test.com'})
  @IsEmail()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'test user'})
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'Test123!!@'})
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'password must include at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  @MinLength(8)
  @MaxLength(20)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{10,15}$/, { message: 'phone must be a valid phone number' })
  phone?: string;
}