import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendAccountActivationEmail(
    userEmail: string,
    token: string,
  ): Promise<SentMessageInfo> {
    const url = `${process.env.BASE_URL}:${process.env.APP_PORT}/auth/activate-account/?token=${token}`;

    return this.mailerService.sendMail({
      to: userEmail,
      subject: 'Welcome to Recipe App! Confirm your Email',
      template: './account-activation-email',
      context: {
        activationLink: url,
      },
    });
  }

  async sendResetPasswordEmail(
    userEmail: string,
    token: string,
  ): Promise<SentMessageInfo> {
    const url = `${process.env.BASE_URL}?token=${token}`;

    return this.mailerService.sendMail({
      to: userEmail,
      subject: 'Reset your password',
      template: './reset-password-email',
      context: {
        resetLink: url,
      },
    });
  }
}
