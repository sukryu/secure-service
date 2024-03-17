import { BadRequestException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ITokenService } from "./token";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ResponseTokenDto } from "./dtos/response-token.dto";

@Injectable()
export class TokenService implements ITokenService {
  private readonly logger = new Logger(TokenService.name);

  private readonly access_token_secret = this.configService.get<string>("ACCESS_TOKEN_SECRET");
  private readonly access_token_expiresIn = this.configService.get<string>('ACCESS_TOKEN_EXPIRESIN');
  
  private readonly refresh_token_secret = this.configService.get<string>("REFRESH_TOKEN_SECRET");
  private readonly refresh_token_expiresIn = this.configService.get<string>("REFRESH_TOKEN_EXPIRESIN");

  private readonly reset_password_token_secret = this.configService.get<string>("RESET_PASSWORD_TOKEN_SECRET");
  private readonly reset_password_token_expiresIn = this.configService.get<string>("RESET_PASSWORD_TOKEN_EXPIRESIN");

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {
  }

  async generateToken(userId: number): Promise<ResponseTokenDto> {
    const payload = { sub: userId };
    const access_token = this.jwt.sign(payload, {
      secret: this.access_token_secret,
      expiresIn: this.access_token_expiresIn,
    });

    const refresh_token = this.jwt.sign(payload, {
      secret: this.refresh_token_secret,
      expiresIn: this.refresh_token_expiresIn,
    });

    await this.prisma.token.create({
      data : {
        userId,
        access_token,
        refresh_token,
        access_token_expires_at: new Date(Date.now() + 15 * 60 * 1000),
        refresh_token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { access_token, refresh_token };
  }

  async generateResetPasswordToken(userId: number): Promise<ResponseTokenDto> {
    const payload = { sub: userId };
    const reset_password_token = this.jwt.sign(payload, {
      secret: this.reset_password_token_secret,
      expiresIn: this.reset_password_token_expiresIn,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        reset_password_token: reset_password_token,
        reset_password_expiresIn: new Date(Date.now() + 60 * 60 * 1000), 
      }
    });

    return { reset_password_token };
  }

  async verifyToken(token: string, type: "access" | "refresh"): Promise<boolean> {
    try {
      const secret = type === "access" ? this.access_token_secret : this.refresh_token_secret;
      const { sub } = this.jwt.verify(token, { secret });
  
      if (type === "refresh") {
        const tokenRecord = await this.prisma.token.findUnique({
          where: { refresh_token: token },
        });
  
        if (!tokenRecord || tokenRecord.refresh_token_expires_at < new Date()) {
          throw new Error();
        }
      }
  
      return true;
    } catch (error) {
      throw new UnauthorizedException(`Invalid or expired ${type} token`);
    }
  }

  async refreshToken(userId: number, refreshToken: string): Promise<ResponseTokenDto> {
    const verify = await this.verifyToken(refreshToken, "refresh");
    if (!verify) {
      throw new UnauthorizedException(`Invalid or expired token`);
    }

    await this.prisma.token.deleteMany({
      where: { userId, refresh_token: refreshToken },
    });

    return this.generateToken(userId);
  }

  async deleteRefreshToken(userId: number, refreshToken: string): Promise<void> {
    await this.prisma.token.deleteMany({
      where: { userId, refresh_token: refreshToken },
    });
  }

  async deleteAllRefreshToken(userId: number): Promise<void> {
    await this.prisma.token.deleteMany({
      where: { userId },
    });
  }
}