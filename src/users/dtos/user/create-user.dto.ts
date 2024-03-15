import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, IsStrongPassword, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {

  @ApiProperty({ example: 'test123@test.com'})
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'test user'})
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Test123!!@'})
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'password must include at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,15}$/, { message: 'phone must be a valid phone number' })
  phone: string;
}