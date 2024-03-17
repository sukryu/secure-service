import { ApiResponse } from "src/utils/response.dto";
import { LoginDto } from "./dtos/login.dto";
import { User } from "@prisma/client";
import { CreateUserDto } from "src/users/dtos/user/create-user.dto";

export interface IAuthService {
  verify(userId: number): Promise<ApiResponse<User>>;
  
  create(createProfile: CreateUserDto): Promise<ApiResponse<User>>;
  
  Login(loginDto: LoginDto): Promise<ApiResponse<User>>;
  Logout(userId: number, refreshToken: string): Promise<void>;

  AllLogoout(userId: number): Promise<void>;

  RequestResetPassword(email: string): Promise<void>;
  //ChangePassword(userId: number, token: string, oldPassword: string, newPassword: string): Promise<User>;
}