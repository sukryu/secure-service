import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from './token/token.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { TypedEventEmitterModule } from 'kafka/event-emitter/typed-event-emitter.module';
import { EmailService } from 'src/mails/email/email.service';

@Module({
  imports: [
    TypedEventEmitterModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("ACCESS_TOKEN_SECRET"),
        signOptions: { expiresIn: configService.get<string>("ACCESS_TOKEN_EXPIRESIN")},
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy, 
    UsersService, 
    AuthService, 
    TokenService, 
    PrismaService,
    EmailService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
