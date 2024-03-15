import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService,PrismaService, RedisService, ConfigService],
  exports: [UsersService],
})
export class UsersModule {}
