import { EventPayloads } from 'src/mails/interface/event-type.interface';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  @OnEvent('user.welcome')
  async welcomeEmail(data: EventPayloads['user.welcome']) {
    const { email, name } = data;

    const subject = `Welcome to Company: ${name}`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: '../shared/welcome',
      context: {
        name,
      },
    });
  }

  @OnEvent('user.reset-password')
  async forgotPasswordEmail(data: EventPayloads['user.reset-password']) {
    const { name, email, link } = data;

    const subject = `Company: Reset Password`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: '../shared/forgot-password',
      context: {
        link,
        name,
      },
    });
  }

  @OnEvent('user.verify-email')
  async verifyEmail(data: EventPayloads['user.verify-email']) {
    const { name, email, otp } = data;

    const subject = `Company: OTP To Verify Email`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: '../shared/verify-email',
      context: {
        otp,
        name,
      },
    });
  }
}