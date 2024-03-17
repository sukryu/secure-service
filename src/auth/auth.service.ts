import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { IAuthService } from "./auth";
import { UsersService } from "src/users/users.service";
import { LoginDto } from "./dtos/login.dto";
import { User } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import * as bcrypt from 'bcrypt';
import { TokenService } from "./token/token.service";
import { ApiResponse } from "src/utils/response.dto";
import { CreateUserDto } from "src/users/dtos/user/create-user.dto";
import { RoleEnum } from "src/roles/role.enum";
import { EmailService } from "src/mails/email/email.service";

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly user: UsersService,
    private readonly prisma: PrismaService,
    private readonly token: TokenService,
    private readonly email: EmailService,
  ) {}

  async verify(userId: number): Promise<ApiResponse<User>> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }});
    if (!user || user.is_deleted == true) {
      this.logger.error(`invalid credentials`);
      throw new BadRequestException(`invalid credentials`);
    }

    delete user.hashedPassword;

    return {
      status: 200,
      message: 'User successfully verified',
      data: user,
    }
  }

  async create(createProfile: CreateUserDto): Promise<ApiResponse<User>> {
    const { email, password, username, phone } = createProfile;

    if (!email || !password || !username || !phone) {
      this.logger.error(`Email or Password or Username or Phone was not provided`);
      throw new BadRequestException(`Email or Password or Username or Phone was not provided`);
    }

    const isExists = await this.prisma.user.findUnique({ where: { email }});
    if (isExists) {
      this.logger.error(`Email is already used`);
      throw new BadRequestException(`Email is already used`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        hashedPassword,
        phone,
        roleId: RoleEnum.user,
      },
    });

    return {
      status: 201,
      message: 'User Successfully created',
      data: user,
    };
  }

  async Login(loginProfile: LoginDto): Promise<ApiResponse<User>> {
    const { email, password } = loginProfile;
  
    // 1. email or password is null?
    if (!email || !password) {
      this.logger.error(`Email or Password was not provided`);
      throw new BadRequestException('Email or Password was not provided');
    }
  
    // 2. verify user.
    const user = await this.user.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    // 3. is account locked?
    if (user.locked_at && user.failed_attempts > 5 && new Date() < new Date(user.locked_at.getTime() + 5 * 60000)) {
      throw new UnauthorizedException('Account is locked. Try again later.');
    }
  
    // 4. verify password.
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      let attempts = user.failed_attempts || 0;
      attempts++;
      await this.updateUserFailedAttempts(user.id, attempts, attempts > 5 ? new Date() : null);
      
      throw new UnauthorizedException('Invalid credentials');
    }
  
    // 5. login success and reset login attemps to 0.
    await this.updateUserFailedAttempts(user.id, 0, null);

    // 6. generate access / refresh Token
    const { access_token, refresh_token } = await this.token.generateToken(user.id);
  
    return {
      status: 200,
      message: 'Login Success',
      data: user,
      token: {
        access_token,
        refresh_token,
      },
    };
  }

  async Logout(userId: number, refreshToken: string): Promise<void> {
    if (!userId) {
      this.logger.error(`userId was not provided`);
      throw new BadRequestException(`userId was not provided`);
    }
    await this.user.verifyUser(userId);
    await this.token.refreshToken(userId, refreshToken);
  }

  async AllLogoout(userId: number): Promise<void> {
    if (!userId) {
      this.logger.error(`userId was not provided`);
      throw new BadRequestException(`userId was not provided`);
    }  

    await this.token.deleteAllRefreshToken(userId);
  }

  async RequestResetPassword(email: string): Promise<void> {
    // 1. verify user.
    const user = await this.user.getUserByEmail(email);

    if (!user) {
      this.logger.error(`user not found : ${email}`);
      throw new NotFoundException(`user not found : ${email}`);
    }

    // 2. generate Reset Password Token.
    const { reset_password_token } = await this.token.generateResetPasswordToken(user.id);
  }

  protected async updateUserFailedAttempts(userId: number, attempts: number, lockedAt: Date | null): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failed_attempts: attempts,
        locked_at: lockedAt,
      },
    });
  }
}