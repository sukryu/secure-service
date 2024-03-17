import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from 'prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './mails/email/email.module';
import { kafkaModule } from 'kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    RedisModule,
    EventEmitterModule.forRoot(),
    kafkaModule,
    AuthModule, 
    UsersModule,
    EmailModule,
    RedisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
